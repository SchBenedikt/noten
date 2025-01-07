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
  school_id?: string;
}

export interface School {
  id: string;
  name: string;
  created_at?: string;
  created_by?: string;
}