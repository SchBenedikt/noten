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
  oralWeight?: number; // Gewichtung der mündlichen Noten (nur für Hauptfächer)
  writtenWeight?: number; // Gewichtung der Schulaufgaben (1 = einfach, 2 = doppelt)
}