export type SubjectType = 'main' | 'secondary';

export interface Grade {
  id: string;
  value: number;
  weight: number;
  type: 'oral' | 'written';
  date: string;
}

export interface Subject {
  id: string;
  name: string;
  type: SubjectType;
  grades: Grade[];
}