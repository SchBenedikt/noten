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

// Add Student type if it's not already defined
export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  grade_level: number;
  role: string;
  created_at: string;
}
