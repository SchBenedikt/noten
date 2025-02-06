export type SubjectType = 'main' | 'secondary';
export type GradeType = 'oral' | 'written';

export interface Grade {
  id: string;
  value: number;
  weight: number;
  type: GradeType;
  date: string;
  notes?: string;
  subject_id?: string;
  created_at?: string;
}

export interface Subject {
  id: string;
  name: string;
  type: SubjectType;
  grades: Grade[];
  writtenWeight?: number;
  user_id?: string;
  created_at?: string;
  grade_level: number;
}

export type AchievementType = 
  | 'first_grade'
  | 'grade_streak'
  | 'perfect_grade'
  | 'improvement'
  | 'subject_master'
  | 'grade_collector'
  | 'subject_collector';

export interface Achievement {
  id: string;
  type: AchievementType;
  subject_id?: string;
  earned_at: string;
  school_year: number;
}