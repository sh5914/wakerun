// src/logic/solver.ts
import type { Member, Room, Constraint, AssignResult, PriorityRank } from '../types';

const PENALTY_WEIGHTS: Record<PriorityRank, number> = {
  S: 1000000,
  A: 1000,
  B: 100,
};

export function calculatePenalty(
  assignments: { [roomId: string]: Member[] },
  constraints: Constraint[],
  rooms: Room[]
): { totalPenalty: number; ignoredConstraints: Constraint[] } {
  let totalPenalty = 0;
  const ignoredConstraints: Constraint[] = [];

  for (const room of rooms) {
    const membersInRoom = assignments[room.id] || [];
    if (membersInRoom.length > room.capacity) {
      totalPenalty += (membersInRoom.length - room.capacity) * PENALTY_WEIGHTS.S;
    }
  }

  const memberRoomMap = new Map<string, string>();
  for (const [roomId, members] of Object.entries(assignments)) {
    for (const m of members) {
      memberRoomMap.set(m.id, roomId);
    }
  }

  for (const constraint of constraints) {
    let isViolated = false;

    if (constraint.type === 'pair' || constraint.type === 'separate') {
      if (!constraint.targetMemberIds) continue;
      const roomA = memberRoomMap.get(constraint.targetMemberIds[0]);
      const roomB = memberRoomMap.get(constraint.targetMemberIds[1]);
      
      if (roomA && roomB) {
        if (constraint.type === 'pair' && roomA !== roomB) isViolated = true;
        if (constraint.type === 'separate' && roomA === roomB) isViolated = true;
      }
    } 
    else if (constraint.type === 'gender_separate') {
      for (const room of rooms) {
        const membersInRoom = assignments[room.id] || [];
        const hasMale = membersInRoom.some(m => m.gender === 'male');
        const hasFemale = membersInRoom.some(m => m.gender === 'female');
        if (hasMale && hasFemale) {
          isViolated = true;
          break;
        }
      }
    }
    else if (constraint.type === 'grade_grouped') {
      for (const room of rooms) {
        const membersInRoom = assignments[room.id] || [];
        if (membersInRoom.length <= 1) continue;
        const firstGrade = membersInRoom[0].grade;
        const hasDifferentGrade = membersInRoom.some(m => m.grade !== firstGrade);
        if (hasDifferentGrade) {
          isViolated = true;
          break;
        }
      }
    }
    else if (constraint.type === 'grade_even') {
      // ★ ここが超賢くなりました！
      // 同室に「同じ学年」が2人以上いたら違反（極力バラバラにする）
      for (const room of rooms) {
        const membersInRoom = assignments[room.id] || [];
        if (membersInRoom.length <= 1) continue;
        
        // 部屋にいるメンバーの学年だけを抽出 (例: [1, 1, 2])
        const grades = membersInRoom.map(m => m.grade);
        // Setを使って重複を消す (例: [1, 1, 2] -> [1, 2])
        const uniqueGrades = new Set(grades);

        // 実際の人数と、重複を消した学年の数が違う ＝ 誰かの学年が被っている！
        if (uniqueGrades.size < membersInRoom.length) {
          isViolated = true;
          break;
        }
      }
    }

    if (isViolated) {
      totalPenalty += PENALTY_WEIGHTS[constraint.priority];
      ignoredConstraints.push(constraint);
    }
  }

  return { totalPenalty, ignoredConstraints };
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function solveAssignments(
  members: Member[],
  rooms: Room[],
  constraints: Constraint[],
  iterations: number = 5000
): AssignResult {
  let bestResult: AssignResult | null = null;
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  
  if (totalCapacity < members.length) {
    throw new Error('部屋の定員合計がメンバー数より少ないため割り振りができません。');
  }

  for (let i = 0; i < iterations; i++) {
    const shuffledMembers = shuffleArray(members);
    const currentAssignments: { [roomId: string]: Member[] } = {};

    for (const room of rooms) {
      currentAssignments[room.id] = [];
    }

    let memberIndex = 0;
    for (const room of rooms) {
      while (currentAssignments[room.id].length < room.capacity && memberIndex < shuffledMembers.length) {
        currentAssignments[room.id].push(shuffledMembers[memberIndex]);
        memberIndex++;
      }
    }

    const { totalPenalty, ignoredConstraints } = calculatePenalty(currentAssignments, constraints, rooms);

    if (!bestResult || totalPenalty < bestResult.totalPenalty) {
      bestResult = {
        roomAssignments: currentAssignments,
        totalPenalty,
        ignoredConstraints,
      };
      if (totalPenalty === 0) break;
    }
  }

  if (!bestResult) {
    throw new Error('組み合わせの生成に失敗しました。');
  }

  return bestResult;
}