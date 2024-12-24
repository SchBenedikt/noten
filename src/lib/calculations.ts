import { Grade, Subject } from '@/types';

export const calculateSubjectAverage = (grades: Grade[]): number => {
  if (grades.length === 0) return 0;
  
  const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
  const weightedSum = grades.reduce((sum, grade) => sum + (grade.value * grade.weight), 0);
  
  return Number((weightedSum / totalWeight).toFixed(2));
};

export const calculateMainSubjectAverages = (grades: Grade[], writtenWeight: number = 2) => {
  const writtenGrades = grades.filter(grade => grade.type === 'written');
  const oralGrades = grades.filter(grade => grade.type === 'oral');

  const writtenAvg = calculateSubjectAverage(writtenGrades);
  const oralAvg = calculateSubjectAverage(oralGrades);

  // Wenn keine Noten vorhanden sind, gib 0 zurück
  if (writtenGrades.length === 0 && oralGrades.length === 0) {
    return { written: writtenAvg, oral: oralAvg, total: 0 };
  }

  // Wenn nur schriftliche Noten vorhanden sind
  if (oralGrades.length === 0) {
    return { written: writtenAvg, oral: oralAvg, total: writtenAvg };
  }

  // Wenn nur mündliche Noten vorhanden sind
  if (writtenGrades.length === 0) {
    return { written: writtenAvg, oral: oralAvg, total: oralAvg };
  }

  // Wenn beide Arten von Noten vorhanden sind, verwende die konfigurierte Gewichtung
  const total = Number(((writtenAvg * writtenWeight + oralAvg) / (writtenWeight + 1)).toFixed(2));

  return {
    written: writtenAvg,
    oral: oralAvg,
    total
  };
};

export const calculateOverallAverage = (subjects: Subject[]): number => {
  // Filtere Fächer ohne Noten heraus
  const mainSubjectsWithGrades = subjects
    .filter(subject => subject.type === 'main' && subject.grades.length > 0);
  const secondarySubjectsWithGrades = subjects
    .filter(subject => subject.type === 'secondary' && subject.grades.length > 0);
  
  // Wenn keine Fächer mit Noten vorhanden sind
  if (mainSubjectsWithGrades.length === 0 && secondarySubjectsWithGrades.length === 0) {
    return 0;
  }

  // Berechne Durchschnitt für Hauptfächer
  const mainAverage = mainSubjectsWithGrades.length > 0
    ? mainSubjectsWithGrades.reduce((sum, subject) => {
        const averages = calculateMainSubjectAverages(subject.grades, subject.writtenWeight || 2);
        return sum + averages.total;
      }, 0) / mainSubjectsWithGrades.length
    : 0;
    
  // Berechne Durchschnitt für Nebenfächer
  const secondaryAverage = secondarySubjectsWithGrades.length > 0
    ? secondarySubjectsWithGrades.reduce((sum, subject) => 
        sum + calculateSubjectAverage(subject.grades), 0) / secondarySubjectsWithGrades.length
    : 0;
  
  // Wenn nur Hauptfächer vorhanden sind
  if (secondarySubjectsWithGrades.length === 0 && mainSubjectsWithGrades.length > 0) {
    return Number(mainAverage.toFixed(2));
  }
  
  // Wenn nur Nebenfächer vorhanden sind
  if (mainSubjectsWithGrades.length === 0 && secondarySubjectsWithGrades.length > 0) {
    return Number(secondaryAverage.toFixed(2));
  }
  
  // Wenn beide Arten von Fächern vorhanden sind (Hauptfächer zählen doppelt)
  return Number(((mainAverage * 2 + secondaryAverage) / 3).toFixed(2));
};