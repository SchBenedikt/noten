
import { useState, useEffect } from 'react';
import { Subject, Grade, SubjectType, GradeType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { createDemoExcel, parseExcelFile } from '@/utils/import';

interface DatabaseSubject {
  id: string;
  name: string;
  type: string;
  written_weight: number | null;
  user_id: string;
  created_at: string;
  grade_level: number;
  grades: DatabaseGrade[];
}

interface DatabaseGrade {
  id: string;
  subject_id: string;
  value: number;
  weight: number;
  type: string;
  date: string;
  created_at: string;
  notes?: string;
}

const mapDatabaseSubjectToSubject = (dbSubject: DatabaseSubject): Subject => ({
  id: dbSubject.id,
  name: dbSubject.name,
  type: dbSubject.type as SubjectType,
  writtenWeight: dbSubject.written_weight || undefined,
  grade_level: dbSubject.grade_level,
  grades: dbSubject.grades.map(mapDatabaseGradeToGrade),
});

const mapDatabaseGradeToGrade = (dbGrade: DatabaseGrade): Grade => ({
  id: dbGrade.id,
  value: dbGrade.value,
  weight: dbGrade.weight,
  type: dbGrade.type as GradeType,
  date: dbGrade.date,
  notes: dbGrade.notes,
});

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentGradeLevel, setCurrentGradeLevel] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserGradeLevel = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        return 5; // Default grade level if not logged in
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('grade_level')
        .eq('id', session.session.user.id)
        .single();

      if (error) {
        console.error("Error fetching grade level:", error);
        return 5;
      }

      console.log("Fetched user grade level:", profileData?.grade_level);
      return profileData?.grade_level || 5;
    } catch (error) {
      console.error("Error in fetchUserGradeLevel:", error);
      return 5;
    }
  };

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        navigate('/login');
        return;
      }

      // Get the current grade level from the database
      const gradeLevel = await fetchUserGradeLevel();
      setCurrentGradeLevel(gradeLevel);
      console.log("useSubjects.fetchSubjects updated currentGradeLevel to:", gradeLevel);

      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select(`
          id,
          name,
          type,
          written_weight,
          user_id,
          created_at,
          grade_level,
          grades (
            id,
            subject_id,
            value,
            weight,
            type,
            date,
            created_at,
            notes
          )
        `)
        .order('created_at', { ascending: true });

      if (subjectsError) {
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Fächer",
          variant: "destructive",
        });
        return;
      }

      setSubjects((subjectsData || []).map(mapDatabaseSubjectToSubject));
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Daten",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSubject = async (newSubject: Omit<Subject, 'id' | 'grades'>): Promise<Subject> => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user) {
      navigate('/login');
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        name: newSubject.name,
        type: newSubject.type as SubjectType,
        written_weight: newSubject.writtenWeight,
        grade_level: newSubject.grade_level,
        user_id: session.session.user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen des Fachs",
        variant: "destructive",
      });
      throw error;
    }

    const newSubjectWithGrades: Subject = {
      id: data.id,
      name: data.name,
      type: data.type as SubjectType,
      writtenWeight: data.written_weight,
      grade_level: data.grade_level,
      grades: []
    };

    setSubjects([...subjects, newSubjectWithGrades]);
    toast({
      title: "Erfolg",
      description: "Fach wurde erfolgreich erstellt",
    });

    return newSubjectWithGrades;
  };

  const addGrade = async (subjectId: string, grade: Omit<Grade, 'id'>) => {
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
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen der Note",
        variant: "destructive",
      });
      return;
    }

    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          grades: [...subject.grades, mapDatabaseGradeToGrade(data)],
        };
      }
      return subject;
    }));

    toast({
      title: "Erfolg",
      description: "Note wurde erfolgreich hinzugefügt",
    });
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

  const deleteSubject = async (subjectId: string) => {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen des Fachs",
        variant: "destructive",
      });
      return;
    }

    setSubjects(subjects.filter(subject => subject.id !== subjectId));
    toast({
      title: "Erfolg",
      description: "Fach wurde erfolgreich gelöscht",
    });
  };

  const updateSubject = async (subjectId: string, updates: Partial<Subject>) => {
    const { error } = await supabase
      .from('subjects')
      .update({
        written_weight: updates.writtenWeight,
      })
      .eq('id', subjectId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren des Fachs",
        variant: "destructive",
      });
      return;
    }

    setSubjects(subjects.map(subject => 
      subject.id === subjectId 
        ? { ...subject, ...updates }
        : subject
    ));

    toast({
      title: "Erfolg",
      description: "Fach wurde erfolgreich aktualisiert",
    });
  };

  const importGradesFromExcel = async (file: File) => {
    try {
      const { subjects: importedSubjects } = await parseExcelFile(file);
      
      for (const [name, data] of importedSubjects.entries()) {
        const subject: Omit<Subject, 'id' | 'grades'> = {
          name,
          type: data.type,
          grade_level: currentGradeLevel,
          writtenWeight: data.type === 'main' ? 2 : undefined
        };
        
        await addSubject(subject).then(async (newSubject) => {
          for (const grade of data.grades) {
            await addGrade(newSubject.id, grade);
          }
        });
      }
      
      toast({
        title: "Import erfolgreich",
        description: "Alle Noten wurden erfolgreich importiert",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Import",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Update the grade level in the database whenever it changes
  useEffect(() => {
    const updateGradeLevelInDb = async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ grade_level: currentGradeLevel })
        .eq('id', session.session.user.id);

      if (error) {
        console.error("Error updating grade level:", error);
      } else {
        console.log("Grade level updated in DB:", currentGradeLevel);
      }
    };

    // Only update if we're not in the initial loading state
    if (!isLoading) {
      updateGradeLevelInDb();
    }
  }, [currentGradeLevel, isLoading]);

  return {
    subjects,
    addSubject,
    addGrade,
    updateGrade,
    deleteGrade,
    deleteSubject,
    updateSubject,
    importGradesFromExcel,
    currentGradeLevel,
    setCurrentGradeLevel,
    fetchSubjects,
    isLoading,
  };
};
