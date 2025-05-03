
import { useState, useEffect, useRef, useCallback } from 'react';
import { Subject } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

import { useAuthStatus } from './use-auth-status';
import { useStudents } from './use-students';
import { useSubjectCrud, mapDatabaseSubjectToSubject } from './use-subject-crud';
import { useGradeCrud } from './use-grade-crud';
import { useExcelImport } from './use-excel-import';
import { useGradeLevel } from './use-grade-level';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Extract auth status logic into its own hook
  const { isTeacher, fetchUserGradeLevel } = useAuthStatus();
  
  // Create state for selected student ID
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Track if we're currently fetching to prevent duplicate fetches
  const isFetchingRef = useRef(false);
  
  // Extract grade level management
  const { 
    currentGradeLevel, 
    updateGradeLevel, 
    completeInitialLoad,
    isInitialLoadComplete,
    isUpdating: isGradeLevelUpdating
  } = useGradeLevel({ 
    initialGradeLevel: 5, 
    isTeacher, 
    selectedStudentId 
  });
  
  // Extract student management into its own hook
  const { 
    students, 
    fetchAllStudents,
    fetchStudentSubjects 
  } = useStudents(currentGradeLevel, updateGradeLevel);
  
  // Function to select a student
  const selectStudent = (studentId: string | null) => {
    setSelectedStudentId(studentId);
  };
  
  // Extract subject CRUD operations
  const { addSubject, updateSubject, deleteSubject } = useSubjectCrud({
    subjects,
    setSubjects,
    currentGradeLevel,
    isTeacher,
    selectedStudentId
  });
  
  // Extract grade CRUD operations
  const { addGrade, updateGrade, deleteGrade } = useGradeCrud({
    subjects,
    setSubjects,
    isTeacher,
    selectedStudentId
  });
  
  // Extract Excel import functionality
  const { importGradesFromExcel } = useExcelImport({
    currentGradeLevel,
    addSubject,
    addGrade
  });

  // Function to fetch subjects based on current grade level and selected student
  const fetchSubjects = useCallback(async (forceFetch = false) => {
    // Prevent duplicate fetches that can cause infinite loops
    if (isFetchingRef.current && !forceFetch) {
      return;
    }
    
    isFetchingRef.current = true;
    setIsLoading(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        navigate('/login');
        return;
      }

      console.log("Fetching subjects for grade level:", currentGradeLevel, 
                 isTeacher ? (selectedStudentId ? `(for student: ${selectedStudentId})` : "(teacher view)") : "");

      // When a teacher has selected a student, fetch the student's subjects
      if (isTeacher && selectedStudentId) {
        const { subjects: studentSubjects, gradeLevel } = await fetchStudentSubjects(selectedStudentId);
        setSubjects(studentSubjects.map(mapDatabaseSubjectToSubject));
        
        // Update the grade level if it's different (but don't trigger a refetch)
        if (gradeLevel !== currentGradeLevel) {
          updateGradeLevel(gradeLevel);
        }
      } else {
        // For regular users (students) or teachers viewing their own data
        if (!isInitialLoadComplete) {
          const gradeLevel = await fetchUserGradeLevel();
          completeInitialLoad(gradeLevel);
          console.log("Initial grade level set to:", gradeLevel);
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
  }, [currentGradeLevel, selectedStudentId, isTeacher, navigate, toast, isInitialLoadComplete, completeInitialLoad, 
      fetchUserGradeLevel, fetchStudentSubjects, updateGradeLevel]);

  // Initial setup: fetch user grade level and subjects
  useEffect(() => {
    const initialFetch = async () => {
      // Get the user's grade level from profile
      const initialGradeLevel = await fetchUserGradeLevel();
      console.log("Initial grade level fetch:", initialGradeLevel);
      
      completeInitialLoad(initialGradeLevel);
      await fetchSubjects(true); // Force fetch on initial load
      
      // If user is a teacher, fetch all students
      if (isTeacher) {
        await fetchAllStudents();
      }
    };
    
    initialFetch();
    // Only run this effect once on component mount
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch subjects when the grade level changes
  useEffect(() => {
    if (!isInitialLoadComplete) {
      return;
    }
    
    // Using a debounce to prevent rapid consecutive fetches
    const timeoutId = setTimeout(() => {
      console.log("Grade level changed to:", currentGradeLevel, "- fetching subjects");
      fetchSubjects();
    }, 300); // Add a small delay to prevent rapid consecutive fetches
    
    return () => clearTimeout(timeoutId);
  }, [currentGradeLevel, isInitialLoadComplete, fetchSubjects]);

  // Fetch subjects when the selected student changes
  useEffect(() => {
    if (!isInitialLoadComplete || !isTeacher) {
      return;
    }
    
    // Don't need to set up another fetching mechanism here
    // as the currentGradeLevel dependency in the above effect will handle it
    if (selectedStudentId) {
      console.log("Selected student changed to:", selectedStudentId);
      // The actual fetch will happen in the fetchSubjects function based on the selectedStudentId
    }
  }, [selectedStudentId, isTeacher, isInitialLoadComplete]);

  // Ensure the return type matches what's being destructured
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
    fetchSubjects,
    isLoading,
    isTeacher,
    students,
    selectedStudentId,
    selectStudent,
    isGradeLevelUpdating,
    updateGradeLevel, // This is the correct name as used in Profile.tsx
  };
};
