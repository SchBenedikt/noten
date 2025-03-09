
import { supabase } from '@/integrations/supabase/client';
import { Subject, Grade, GradeType } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface UseGradeCrudProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  isTeacher: boolean;
  selectedStudentId: string | null;
}

export const useGradeCrud = ({
  subjects,
  setSubjects,
  isTeacher,
  selectedStudentId,
}: UseGradeCrudProps) => {

  const addGrade = async (subjectId: string, grade: Omit<Grade, 'id'>) => {
    try {
      // First, get the subject to determine the user_id (student)
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) {
        toast({
          title: "Fehler",
          description: "Das ausgewählte Fach wurde nicht gefunden",
          variant: "destructive",
        });
        return;
      }

      // Insert the grade
      const { data, error } = await supabase
        .from('grades')
        .insert({
          subject_id: subjectId,
          value: grade.value,
          weight: grade.weight,
          type: grade.type,
          date: grade.date,
          notes: grade.notes,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding grade:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Hinzufügen der Note: " + error.message,
          variant: "destructive",
        });
        return;
      }

      // If teacher is adding a grade for a student, try to add achievements manually
      // instead of relying on the database trigger that might be blocked by RLS
      if (isTeacher && selectedStudentId) {
        try {
          // Get current school year
          const date = new Date(grade.date);
          const currentSchoolYear = date.getMonth() < 7 
            ? date.getFullYear() - 1 
            : date.getFullYear();
          
          // Try to add first grade achievement if needed
          const { error: achievementError } = await supabase
            .from('achievements')
            .insert({
              user_id: selectedStudentId,
              type: 'first_grade',
              school_year: currentSchoolYear,
              subject_id: subjectId
            })
            .select()
            .single();
            
          // Ignore errors for achievements since they might already exist (duplicate key)
          if (achievementError && !achievementError.message.includes('duplicate key')) {
            console.log("Info: Achievement not added:", achievementError);
          }
          
          // For perfect grade (1.0)
          if (grade.value === 1.0) {
            await supabase
              .from('achievements')
              .insert({
                user_id: selectedStudentId,
                type: 'perfect_grade',
                school_year: currentSchoolYear,
                subject_id: subjectId
              })
              .select();
          }
        } catch (achievementError) {
          console.log("Info: Error adding achievements, but continuing:", achievementError);
          // We don't want to fail the grade creation if achievements can't be added
        }
      }

      // Update the subjects state with the new grade
      setSubjects(subjects.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            grades: [...subject.grades, {
              id: data.id,
              value: data.value,
              weight: data.weight,
              type: data.type as GradeType, // Explicitly cast to GradeType
              date: data.date,
              notes: data.notes,
            }],
          };
        }
        return subject;
      }));

      toast({
        title: "Erfolg",
        description: "Note wurde erfolgreich hinzugefügt",
      });
    } catch (error) {
      console.error("Unexpected error in addGrade:", error);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  const updateGrade = async (subjectId: string, gradeId: string, updatedGrade: Omit<Grade, 'id'>) => {
    const { error } = await supabase
      .from('grades')
      .update({
        value: updatedGrade.value,
        weight: updatedGrade.weight,
        type: updatedGrade.type,
        date: updatedGrade.date,
        notes: updatedGrade.notes,
      })
      .eq('id', gradeId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren der Note",
        variant: "destructive",
      });
      return;
    }

    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          grades: subject.grades.map(grade => 
            grade.id === gradeId ? { ...updatedGrade, id: gradeId } : grade
          ),
        };
      }
      return subject;
    }));

    toast({
      title: "Erfolg",
      description: "Note wurde erfolgreich aktualisiert",
    });
  };

  const deleteGrade = async (subjectId: string, gradeId: string) => {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', gradeId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen der Note",
        variant: "destructive",
      });
      return;
    }

    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          grades: subject.grades.filter(grade => grade.id !== gradeId),
        };
      }
      return subject;
    }));

    toast({
      title: "Erfolg",
      description: "Note wurde erfolgreich gelöscht",
    });
  };

  return {
    addGrade,
    updateGrade,
    deleteGrade
  };
};
