import { useState, useEffect } from 'react';
import { Subject, Grade, SubjectType, GradeType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface DatabaseSubject {
  id: string;
  name: string;
  type: string;
  written_weight: number | null;
  user_id: string;
  created_at: string;
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
}

const mapDatabaseSubjectToSubject = (dbSubject: DatabaseSubject): Subject => ({
  id: dbSubject.id,
  name: dbSubject.name,
  type: dbSubject.type as SubjectType,
  writtenWeight: dbSubject.written_weight || undefined,
  grades: dbSubject.grades.map(mapDatabaseGradeToGrade),
});

const mapDatabaseGradeToGrade = (dbGrade: DatabaseGrade): Grade => ({
  id: dbGrade.id,
  value: dbGrade.value,
  weight: dbGrade.weight,
  type: dbGrade.type as GradeType,
  date: dbGrade.date,
});

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const navigate = useNavigate();

  const fetchSubjects = async () => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user) {
      navigate('/login');
      return;
    }

    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        type,
        written_weight,
        user_id,
        created_at,
        grades (
          id,
          subject_id,
          value,
          weight,
          type,
          date,
          created_at
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
  };

  const addSubject = async (newSubject: Omit<Subject, 'id' | 'grades'>) => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        name: newSubject.name,
        type: newSubject.type,
        written_weight: newSubject.writtenWeight,
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
      return;
    }

    setSubjects([...subjects, mapDatabaseSubjectToSubject({ ...data, grades: [] })]);
    toast({
      title: "Erfolg",
      description: "Fach wurde erfolgreich erstellt",
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

  const addGrade = async (subjectId: string, grade: Omit<Grade, 'id'>) => {
    const { data, error } = await supabase
      .from('grades')
      .insert({
        subject_id: subjectId,
        value: grade.value,
        weight: grade.weight,
        type: grade.type,
        date: grade.date,
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

  const updateGrade = async (subjectId: string, gradeId: string, updatedGrade: Omit<Grade, 'id'>) => {
    const { error } = await supabase
      .from('grades')
      .update({
        value: updatedGrade.value,
        weight: updatedGrade.weight,
        type: updatedGrade.type,
        date: updatedGrade.date,
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

  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    addSubject,
    addGrade,
    updateGrade,
    deleteGrade,
    deleteSubject,
    updateSubject,
  };
};
