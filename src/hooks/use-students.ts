
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface StudentProfile {
  id: string;
  first_name: string | null;
  grade_level: number;
  school_id: string | null;
}

export const useStudents = (
  currentGradeLevel: number,
  setCurrentGradeLevel: (level: number) => void
) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);

  const fetchAllStudents = async () => {
    try {
      const { data: studentsData, error } = await supabase
        .from('profiles')
        .select('id, first_name, grade_level, school_id, role')
        .eq('role', 'student');

      if (error) {
        console.error("Error fetching students:", error);
        return;
      }

      setStudents(studentsData || []);
    } catch (error) {
      console.error("Error in fetchAllStudents:", error);
    }
  };

  const fetchStudentSubjects = async (studentId: string) => {
    try {
      // First get the student's grade level
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('grade_level')
        .eq('id', studentId)
        .single();
      
      if (studentError) {
        console.error("Error fetching student grade level:", studentError);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Schülerdaten",
          variant: "destructive",
        });
        return { subjects: [], gradeLevel: currentGradeLevel };
      }
      
      // Update the current grade level to match the student's
      if (studentData.grade_level !== currentGradeLevel) {
        setCurrentGradeLevel(studentData.grade_level);
      }
      console.log("Updated current grade level to student's grade level:", studentData.grade_level);
      
      // Now fetch subjects filtered by student ID and their grade level
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
        .eq('user_id', studentId)
        .eq('grade_level', studentData.grade_level) // Filter by the student's current grade level
        .order('created_at', { ascending: true });

      if (subjectsError) {
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Schülerfächer",
          variant: "destructive",
        });
        return { subjects: [], gradeLevel: studentData.grade_level };
      }

      console.log("Fetched student subjects:", subjectsData?.length || 0, "for grade level:", studentData.grade_level);
      return { 
        subjects: subjectsData || [], 
        gradeLevel: studentData.grade_level 
      };
    } catch (error) {
      console.error("Error fetching student subjects:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Schülerdaten",
        variant: "destructive",
      });
      return { subjects: [], gradeLevel: currentGradeLevel };
    }
  };

  return {
    students,
    fetchAllStudents,
    fetchStudentSubjects,
  };
};
