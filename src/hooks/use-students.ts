import { useState, useEffect } from 'react';
import { Student } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Subject } from '@/types';

interface UseStudentsResult {
  students: Student[];
  fetchAllStudents: () => Promise<void>;
  fetchStudentSubjects: (studentId: string) => Promise<{ subjects: Subject[], gradeLevel: number }>;
}

export const useStudents = (currentGradeLevel: number): UseStudentsResult => {
  const [students, setStudents] = useState<Student[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchAllStudents = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        navigate('/login');
        return;
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('teacher_id', session.session.user.id);

      if (error) {
        console.error("Error fetching students:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Schüler",
          variant: "destructive",
        });
        return;
      }

      setStudents(profiles as Student[]);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Schüler",
        variant: "destructive",
      });
    }
  };

  const fetchStudentSubjects = async (studentId: string) => {
    try {
      const { data: studentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('grade_level')
        .eq('id', studentId)
        .single();

      if (profileError) {
        console.error("Error fetching student profile:", profileError);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden des Schülerprofils",
          variant: "destructive",
        });
        return { subjects: [], gradeLevel: currentGradeLevel };
      }

      const studentGradeLevel = studentProfile?.grade_level || currentGradeLevel;

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
        .eq('grade_level', studentGradeLevel)
        .order('created_at', { ascending: true });

      if (subjectsError) {
        console.error("Error fetching student subjects:", subjectsError);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Fächer des Schülers",
          variant: "destructive",
        });
        return { subjects: [], gradeLevel: currentGradeLevel };
      }

      return {
        subjects: subjectsData || [],
        gradeLevel: studentGradeLevel,
      };
    } catch (error) {
      console.error("Error fetching student subjects:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Fächer des Schülers",
        variant: "destructive",
      });
      return { subjects: [], gradeLevel: currentGradeLevel };
    }
  };

  useEffect(() => {
    // Fetch all students when the component mounts
    fetchAllStudents();
  }, []);

  return {
    students,
    fetchAllStudents,
    fetchStudentSubjects,
  };
};
