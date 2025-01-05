import { Subject, Grade } from '@/types';

export interface UseSubjectsHook {
  subjects: Subject[];
  addSubject: (newSubject: Omit<Subject, 'id' | 'grades'>) => Promise<void>;
  addGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  updateGrade: (subjectId: string, gradeId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  deleteGrade: (subjectId: string, gradeId: string) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  updateSubject: (subjectId: string, updates: Partial<Subject>) => Promise<void>;
}

export interface DatabaseSubject {
  id: string;
  name: string;
  type: string;
  written_weight: number | null;
  user_id: string;
  created_at: string;
  grade_level: number;
  grades: DatabaseGrade[];
}

export interface DatabaseGrade {
  id: string;
  subject_id: string;
  value: number;
  weight: number;
  type: string;
  date: string;
  created_at: string;
  notes?: string;
}