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
      if (!constraint.targetIds) continue;
      const roomA = memberRoomMap.get(constraint.targetIds[0]);
      const roomB = memberRoomMap.get(constraint.targetIds[1]);
      
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
      let gradePenaltySum = 0;

      for (const room of rooms) {
        const membersInRoom = assignments[room.id] || [];
        if (membersInRoom.length <= 1) continue;

        // この部屋にいる「各学年の人数」を数える
        const gradeCounts: Record<string, number> = {};
        for (const m of membersInRoom) {
          const g = String(m.grade);
          gradeCounts[g] = (gradeCounts[g] || 0) + 1;
        }

        // 被り具合（偏り）を計算してペナルティの「重み」を算出する
        for (const count of Object.values(gradeCounts)) {
          if (count > 1) {
            // 被り人数から1を引いた数を2乗する
            // （2人なら1点、3人固まると4点、4人固まると9点...と、密集するほど罰則を重くする）
            gradePenaltySum += Math.pow(count - 1, 2);
          }
        }
      }

      if (gradePenaltySum > 0) {
        // 標準の1回分のペナルティ（ループの下で自動加算される）に加えて、
        // 被りのひどさに応じた「追加ペナルティ」をここで加算する
        if (gradePenaltySum > 1) {
          totalPenalty += (gradePenaltySum - 1) * PENALTY_WEIGHTS[constraint.priority];
        }
        isViolated = true;
      }
    }

    else if (constraint.type === 'tag_grouped') {
      // 特定のタグを持つ人を同じ部屋に集める（喫煙者など）
      if (!constraint.targetTag) continue;
      let roomsWithTag = 0;
      for (const room of rooms) {
        const membersInRoom = assignments[room.id] || [];
        const hasTag = membersInRoom.some(m => m.tags?.includes(constraint.targetTag!));
        if (hasTag) {
          roomsWithTag++;
        }
      }
      // タグを持つ人が2つ以上の部屋に散らばってしまったら違反
      if (roomsWithTag > 1) {
        isViolated = true;
      }
    }
    else if (constraint.type === 'tag_separate') {
      // 特定のタグを持つ人を別の部屋に分散させる（幹事など）
      if (!constraint.targetTag) continue;
      for (const room of rooms) {
        const membersInRoom = assignments[room.id] || [];
        const tagCount = membersInRoom.filter(m => m.tags?.includes(constraint.targetTag!)).length;
        // 2人以上同じ部屋に固まってしまったら違反
        if (tagCount > 1) {
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