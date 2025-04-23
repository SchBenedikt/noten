import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subject, Grade, SubjectType, GradeType } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

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

interface UseSubjectCrudProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  currentGradeLevel: number;
  isTeacher: boolean;
  selectedStudentId: string | null;
}

export const mapDatabaseSubjectToSubject = (dbSubject: DatabaseSubject): Subject => ({
  id: dbSubject.id,
  name: dbSubject.name,
  type: dbSubject.type as SubjectType,
  writtenWeight: dbSubject.written_weight || undefined,
  grade_level: dbSubject.grade_level,
  grades: dbSubject.grades ? dbSubject.grades.map(mapDatabaseGradeToGrade) : [],
});

export const mapDatabaseGradeToGrade = (dbGrade: DatabaseGrade): Grade => ({
  id: dbGrade.id,
  value: dbGrade.value,
  weight: dbGrade.weight,
  type: dbGrade.type as GradeType,
  date: dbGrade.date,
  notes: dbGrade.notes,
});

export const useSubjectCrud = ({
  subjects,
  setSubjects,
  currentGradeLevel,
  isTeacher,
  selectedStudentId,
}: UseSubjectCrudProps) => {
  const navigate = useNavigate();

  const addSubject = async (newSubject: Omit<Subject, 'id' | 'grades'>): Promise<Subject> => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user) {
      navigate('/login');
      throw new Error('Not authenticated');
    }

    const targetUserId = isTeacher && selectedStudentId ? selectedStudentId : session.session.user.id;
    
    // Use the grade level from newSubject or the current grade level if not specified
    const targetGradeLevel = newSubject.grade_level !== undefined ? 
      newSubject.grade_level : currentGradeLevel;
    
    console.log(`Adding subject "${newSubject.name}" with grade level:`, targetGradeLevel);

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        name: newSubject.name,
        type: newSubject.type as SubjectType,
        written_weight: newSubject.writtenWeight,
        grade_level: targetGradeLevel,
        user_id: targetUserId,
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

    // Add the new subject to the state ONLY if it matches the current grade level
    if (data.grade_level === currentGradeLevel) {
      setSubjects(prevSubjects => [...prevSubjects, newSubjectWithGrades]);
    }
    
    toast({
      title: "Erfolg",
      description: `Fach "${data.name}" wurde erfolgreich für Jahrgang ${data.grade_level} erstellt`,
    });

    return newSubjectWithGrades;
  };

  const updateSubject = async (subjectId: string, updates: Partial<Subject>) => {
    const updateData: any = {};
    
    if (updates.writtenWeight !== undefined) {
      updateData.written_weight = updates.writtenWeight;
    }
    
    if (updates.grade_level !== undefined) {
      updateData.grade_level = updates.grade_level;
    }
    
    if (Object.keys(updateData).length === 0) {
      return; // Nothing to update
    }

    const { error } = await supabase
      .from('subjects')
      .update(updateData)
      .eq('id', subjectId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren des Fachs",
        variant: "destructive",
      });
      return;
    }

    // If the grade level is being updated to something different than the current one,
    // we need to remove it from the local state to maintain consistency
    if (updates.grade_level !== undefined && updates.grade_level !== currentGradeLevel) {
      setSubjects(prevSubjects => prevSubjects.filter(subject => subject.id !== subjectId));
      
      toast({
        title: "Erfolg",
        description: `Fach wurde auf Jahrgangsstufe ${updates.grade_level} verschoben`,
      });
      return;
    }

    // Otherwise, update the local state
    setSubjects(prevSubjects => prevSubjects.map(subject => 
      subject.id === subjectId 
        ? { ...subject, ...updates }
        : subject
    ));

    toast({
      title: "Erfolg",
      description: "Fach wurde erfolgreich aktualisiert",
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

    setSubjects(prevSubjects => prevSubjects.filter(subject => subject.id !== subjectId));
    toast({
      title: "Erfolg",
      description: "Fach wurde erfolgreich gelöscht",
    });
  };

  return {
    addSubject,
    updateSubject,
    deleteSubject
  };
};
