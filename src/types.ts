// src/types.ts
export type PriorityRank = 'S' | 'A' | 'B';

export interface Member {
  id: string;
  name: string;
  gender: 'male' | 'female';
  grade: string | number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface Constraint {
  id: string;
  // ★ ここに新しいルールを追加！
  type: 'pair' | 'separate' | 'gender_separate' | 'grade_grouped' | 'grade_even';
  targetMemberIds?: [string, string]; // ペア指定の時だけ使うので ? (任意) にする
  priority: PriorityRank;
}

export interface AssignResult {
  roomAssignments: { [roomId: string]: Member[] };
  totalPenalty: number;
  ignoredConstraints: Constraint[];
}

export type GradeMode = 'none' | 'normal' | 'univ';