import { Subject, Grade } from '@/types';
import { DatabaseSubject, DatabaseGrade } from './types';

export const mapDatabaseSubjectToSubject = (dbSubject: DatabaseSubject): Subject => ({
  id: dbSubject.id,
  name: dbSubject.name,
  type: dbSubject.type as Subject['type'],
  writtenWeight: dbSubject.written_weight || undefined,
  gradeLevel: dbSubject.grade_level,
  grades: dbSubject.grades.map(mapDatabaseGradeToGrade),
});

export const mapDatabaseGradeToGrade = (dbGrade: DatabaseGrade): Grade => ({
  id: dbGrade.id,
  value: dbGrade.value,
  weight: dbGrade.weight,
  type: dbGrade.type as Grade['type'],
  date: dbGrade.date,
  notes: dbGrade.notes,
});