import { Grade, Subject } from '@/types';

export const calculateSubjectAverage = (grades: Grade[]): number => {
  if (grades.length === 0) return 0;
  
  const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
  const weightedSum = grades.reduce((sum, grade) => sum + (grade.value * grade.weight), 0);
  
  return Number((weightedSum / totalWeight).toFixed(2));
};

export const calculateOverallAverage = (subjects: Subject[]): number => {
  if (subjects.length === 0) return 0;
  
  const mainSubjects = subjects.filter(subject => subject.type === 'main');
  const secondarySubjects = subjects.filter(subject => subject.type === 'secondary');
  
  const mainAverage = mainSubjects.reduce((sum, subject) => sum + calculateSubjectAverage(subject.grades), 0) / (mainSubjects.length || 1);
  const secondaryAverage = secondarySubjects.reduce((sum, subject) => sum + calculateSubjectAverage(subject.grades), 0) / (secondarySubjects.length || 1);
  
  // Hauptfächer zählen doppelt
  return Number(((mainAverage * 2 + secondaryAverage) / 3).toFixed(2));
};