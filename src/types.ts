export type GradeMode = 'none' | 'normal' | 'univ';

export interface Member {
  id: string;
  name: string;
  grade: string | number;
  gender: 'male' | 'female';
  tags?: string[]; // ✨ 追加: 自由に設定できるタグ機能
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

// ✨ 追加: tag_grouped（同じタグを集める）, tag_separate（同じタグを散らす）
export type ConstraintType = 'gender_separate' | 'grade_grouped' | 'grade_even' | 'pair' | 'separate' | 'tag_grouped' | 'tag_separate';

export type PriorityRank = 'S' | 'A' | 'B';

export interface Constraint {
  id: string;
  type: ConstraintType;
  priority: PriorityRank;
  targetIds?: string[];
  targetTag?: string; // ✨ 追加: タグ条件を使う時の「対象のタグ名」
}

export interface AssignResult {
  roomAssignments: Record<string, Member[]>;
  totalPenalty: number;
  ignoredConstraints: Constraint[];
}