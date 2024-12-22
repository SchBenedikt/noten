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
  
  // Berechne Durchschnitt nur für Fächer mit Noten
  const mainSubjectsWithGrades = mainSubjects.filter(subject => subject.grades.length > 0);
  const secondarySubjectsWithGrades = secondarySubjects.filter(subject => subject.grades.length > 0);
  
  if (mainSubjectsWithGrades.length === 0 && secondarySubjectsWithGrades.length === 0) return 0;
  
  const mainAverage = mainSubjectsWithGrades.length > 0
    ? mainSubjectsWithGrades.reduce((sum, subject) => sum + calculateSubjectAverage(subject.grades), 0) / mainSubjectsWithGrades.length
    : 0;
    
  const secondaryAverage = secondarySubjectsWithGrades.length > 0
    ? secondarySubjectsWithGrades.reduce((sum, subject) => sum + calculateSubjectAverage(subject.grades), 0) / secondarySubjectsWithGrades.length
    : 0;
  
  // Wenn keine Hauptfächer vorhanden sind, gib nur den Durchschnitt der Nebenfächer zurück
  if (mainSubjectsWithGrades.length === 0) return Number(secondaryAverage.toFixed(2));
  
  // Wenn keine Nebenfächer vorhanden sind, gib nur den Durchschnitt der Hauptfächer zurück
  if (secondarySubjectsWithGrades.length === 0) return Number(mainAverage.toFixed(2));
  
  // Hauptfächer zählen doppelt (2:1 Gewichtung)
  return Number(((mainAverage * 2 + secondaryAverage) / 3).toFixed(2));
};