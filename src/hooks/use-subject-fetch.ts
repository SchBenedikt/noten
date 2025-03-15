
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Subject } from '@/types';
import { mapDatabaseSubjectToSubject } from './use-subject-crud';

interface UseSubjectFetchProps {
  currentGradeLevel: number;
  isTeacher: boolean;
  selectedStudentId: string | null;
  markGradeLevelSuccess: () => void;
}

export const useSubjectFetch = ({
  currentGradeLevel,
  isTeacher,
  selectedStudentId,
  markGradeLevelSuccess
}: UseSubjectFetchProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isFetchingRef = useRef(false);
  const lastFetchParamsRef = useRef({ isTeacher: false, studentId: null, gradeLevel: 5 });

  const fetchSubjects = async (forceFetch = false) => {
    // Skip if already fetching to prevent race conditions
    if (isFetchingRef.current && !forceFetch) {
      return;
    }
    
    // Skip if parameters haven't changed and not forcing fetch
    const currentParams = { 
      isTeacher, 
      studentId: selectedStudentId, 
      gradeLevel: currentGradeLevel 
    };
    
    if (!forceFetch && 
        JSON.stringify(currentParams) === JSON.stringify(lastFetchParamsRef.current) && 
        !isLoading) {
      return;
    }
    
    console.log("Fetching subjects with params:", JSON.stringify(currentParams));
    lastFetchParamsRef.current = currentParams;
    isFetchingRef.current = true;
    setIsLoading(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        navigate('/login');
        return;
      }

      // When a teacher has selected a student, we'll handle that in the main hook using fetchStudentSubjects
      if (!isTeacher || !selectedStudentId) {
        // Fetch own subjects for students and teachers viewing their own data
        console.log("Fetching subjects for grade level:", currentGradeLevel);
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
          .eq('user_id', session.session.user.id)
          .eq('grade_level', currentGradeLevel) // Filter subjects by the current grade level
          .order('created_at', { ascending: true });

        if (subjectsError) {
          console.error("Error loading subjects:", subjectsError);
          toast({
            title: "Fehler",
            description: "Fehler beim Laden der Fächer",
            variant: "destructive",
          });
          return;
        }

        console.log("Fetched subjects:", subjectsData?.length || 0, "for grade level:", currentGradeLevel);
        setSubjects((subjectsData || []).map(mapDatabaseSubjectToSubject));
        markGradeLevelSuccess();
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Daten",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  return {
    subjects,
    setSubjects,
    isLoading,
    fetchSubjects
  };
};
