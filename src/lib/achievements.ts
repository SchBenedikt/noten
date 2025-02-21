
import { supabase } from "@/integrations/supabase/client";
import { Grade } from "@/types";

export const fetchAndCreateMissingAchievements = async () => {
  // Zuerst alle bestehenden Auszeichnungen löschen
  const { error: deleteError } = await supabase
    .from('achievements')
    .delete()
    .neq('id', ''); // Löscht alle Einträge

  if (deleteError) {
    console.error('Error deleting achievements:', deleteError);
    throw deleteError;
  }

  // Alle Noten abrufen, gruppiert nach Benutzer
  const { data: gradesData, error: gradesError } = await supabase
    .from('grades')
    .select(`
      *,
      subjects!inner (
        user_id,
        name
      )
    `)
    .order('date', { ascending: true });

  if (gradesError) {
    console.error('Error fetching grades:', gradesError);
    throw gradesError;
  }

  const grades = gradesData as (Grade & { subjects: { user_id: string, name: string } })[];
  
  // Gruppiere Noten nach Benutzer
  const userGrades = new Map<string, Grade[]>();
  grades.forEach(grade => {
    const userId = grade.subjects.user_id;
    if (!userGrades.has(userId)) {
      userGrades.set(userId, []);
    }
    userGrades.get(userId)?.push(grade);
  });

  const achievements = [];
  const currentYear = new Date().getFullYear();

  // Für jeden Benutzer Auszeichnungen prüfen
  for (const [userId, userGradesList] of userGrades.entries()) {
    // 1. Erste Note des Schuljahres
    if (userGradesList.length > 0) {
      achievements.push({
        type: 'first_grade',
        user_id: userId,
        earned_at: new Date().toISOString(),
        school_year: currentYear
      });
    }

    // 2. Perfekte Note (1.0)
    const perfectGrades = userGradesList.filter(grade => grade.value === 1.0);
    if (perfectGrades.length > 0) {
      achievements.push({
        type: 'perfect_grade',
        user_id: userId,
        earned_at: new Date().toISOString(),
        school_year: currentYear,
        subject_id: perfectGrades[0].subject_id
      });
    }

    // 3. Notensammler (10 Noten)
    if (userGradesList.length >= 10) {
      achievements.push({
        type: 'grade_collector',
        user_id: userId,
        earned_at: new Date().toISOString(),
        school_year: currentYear
      });
    }

    // 4. Notenserie (Noten an aufeinanderfolgenden Tagen)
    const sortedDates = userGradesList
      .map(grade => new Date(grade.date).getTime())
      .sort((a, b) => a - b);
    
    for (let i = 0; i < sortedDates.length - 2; i++) {
      const day1 = new Date(sortedDates[i]).getDate();
      const day2 = new Date(sortedDates[i + 1]).getDate();
      const day3 = new Date(sortedDates[i + 2]).getDate();
      
      if (day2 === day1 + 1 && day3 === day2 + 1) {
        achievements.push({
          type: 'grade_streak',
          user_id: userId,
          earned_at: new Date().toISOString(),
          school_year: currentYear
        });
        break;
      }
    }

    // 5. Fächersammler (5 verschiedene Fächer)
    const uniqueSubjects = new Set(userGradesList.map(grade => grade.subject_id));
    if (uniqueSubjects.size >= 5) {
      achievements.push({
        type: 'subject_collector',
        user_id: userId,
        earned_at: new Date().toISOString(),
        school_year: currentYear
      });
    }

    // 6. Berechne Durchschnitte pro Fach für Fachmeister und Verbesserungen
    const subjectGrades = new Map<string, Grade[]>();
    userGradesList.forEach(grade => {
      if (!subjectGrades.has(grade.subject_id!)) {
        subjectGrades.set(grade.subject_id!, []);
      }
      subjectGrades.get(grade.subject_id!)?.push(grade);
    });

    for (const [subjectId, grades] of subjectGrades.entries()) {
      const average = grades.reduce((sum, grade) => sum + grade.value * grade.weight, 0) / 
                     grades.reduce((sum, grade) => sum + grade.weight, 0);

      // Fachmeister (Durchschnitt 2.0 oder besser)
      if (average <= 2.0) {
        achievements.push({
          type: 'subject_master',
          user_id: userId,
          subject_id: subjectId,
          earned_at: new Date().toISOString(),
          school_year: currentYear
        });
      }

      // Verbesserung (wenn der aktuelle Durchschnitt besser ist als der vorherige)
      const halfwayIndex = Math.floor(grades.length / 2);
      const firstHalf = grades.slice(0, halfwayIndex);
      const secondHalf = grades.slice(halfwayIndex);

      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstAvg = firstHalf.reduce((sum, grade) => sum + grade.value * grade.weight, 0) / 
                        firstHalf.reduce((sum, grade) => sum + grade.weight, 0);
        const secondAvg = secondHalf.reduce((sum, grade) => sum + grade.value * grade.weight, 0) / 
                         secondHalf.reduce((sum, grade) => sum + grade.weight, 0);

        if (secondAvg < firstAvg) {
          achievements.push({
            type: 'improvement',
            user_id: userId,
            subject_id: subjectId,
            earned_at: new Date().toISOString(),
            school_year: currentYear
          });
        }
      }
    }
  }

  // Neue Auszeichnungen speichern
  if (achievements.length > 0) {
    const { error: insertError } = await supabase
      .from('achievements')
      .insert(achievements);

    if (insertError) {
      console.error('Error inserting achievements:', insertError);
      throw insertError;
    }
  }
};
