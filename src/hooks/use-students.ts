
import { useState, useEffect, useCallback } from 'react';
import { Student, Subject } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type DatabaseSubject = {
  id: string;
  name: string;
  type: string;
  written_weight: number;
  user_id: string;
  created_at: string;
  grade_level: number;
  grades: {
    id: string;
    subject_id: string;
    value: number;
    weight: number;
    type: string;
    date: string;
    created_at: string;
    notes: string;
  }[];
};

// Transform database subject to application subject
const transformDbSubjectToSubject = (dbSubject: DatabaseSubject): Subject => {
  return {
    id: dbSubject.id,
    name: dbSubject.name,
    type: dbSubject.type as any, // Cast to SubjectType
    writtenWeight: dbSubject.written_weight,
    gradeLevel: dbSubject.grade_level,
    grades: dbSubject.grades.map(grade => ({
      id: grade.id,
      subjectId: grade.subject_id,
      value: grade.value,
      weight: grade.weight,
      type: grade.type,
      date: grade.date,
      createdAt: grade.created_at,
      notes: grade.notes
    }))
  };
};

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (error) {
        throw error;
      }

      const studentsList = data as Student[];
      
      // Sort alphabetically
      studentsList.sort((a, b) => 
        `${a.last_name}${a.first_name}`.localeCompare(`${b.last_name}${b.first_name}`)
      );
      
      setStudents(studentsList);
      return studentsList;
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Schüler: " + error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchStudentSubjects = async (studentId: string): Promise<{ subjects: Subject[]; gradeLevel: number }> => {
    try {
      // First get the student's grade level
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('grade_level')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;
      
      const gradeLevel = studentData?.grade_level || 5;

      // Then get their subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select(`
          *,
          grades (*)
        `)
        .eq('user_id', studentId)
        .eq('grade_level', gradeLevel);

      if (subjectsError) throw subjectsError;
      
      // Transform database subjects to application subjects
      const subjects: Subject[] = (subjectsData as DatabaseSubject[]).map(transformDbSubjectToSubject);
      
      return {
        subjects,
        gradeLevel
      };
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Fächer: " + error.message,
        variant: "destructive",
      });
      
      return {
        subjects: [],
        gradeLevel: 5
      };
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, fetchStudents, isLoading, fetchStudentSubjects };
};
