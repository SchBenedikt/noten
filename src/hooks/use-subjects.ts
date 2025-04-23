
import { useState, useEffect, useRef } from 'react';
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
  
  // Track fetch state to prevent race conditions
  const isFetchingRef = useRef(false);
  
  // Remember the last parameters used for fetching to avoid redundant fetches
  const lastFetchParamsRef = useRef({ gradeLevel: 5, isTeacher: false, studentId: null });

  // Extract auth status logic into its own hook
  const { isTeacher, fetchUserGradeLevel } = useAuthStatus();
  
  // Create state for selected student ID
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Extract grade level management
  const { 
    currentGradeLevel, 
    setCurrentGradeLevel, 
    completeInitialLoad,
    isInitialLoadComplete,
    isUpdatePending
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
  } = useStudents(currentGradeLevel, setCurrentGradeLevel);
  
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

  const fetchSubjects = async (forceFetch = false) => {
    // Skip if already fetching to prevent race conditions
    if (isFetchingRef.current && !forceFetch) {
      return;
    }
    
    // Build the current fetch parameters
    const currentParams = { 
      gradeLevel: currentGradeLevel, 
      isTeacher, 
      studentId: selectedStudentId 
    };
    
    // Skip if parameters haven't changed and not forcing fetch
    const shouldSkipFetch = 
      !forceFetch && 
      JSON.stringify(currentParams) === JSON.stringify(lastFetchParamsRef.current) && 
      !isLoading && 
      !isUpdatePending;
      
    if (shouldSkipFetch) {
      console.log("Skipping fetchSubjects - parameters unchanged:", JSON.stringify(currentParams));
      return;
    }
    
    console.log("Fetching subjects with params:", JSON.stringify(currentParams));
    lastFetchParamsRef.current = { ...currentParams };
    isFetchingRef.current = true;
    setIsLoading(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        navigate('/login');
        return;
      }

      // When a teacher has selected a student, fetch the student's subjects
      if (isTeacher && selectedStudentId) {
        const { subjects: studentSubjects, gradeLevel } = await fetchStudentSubjects(selectedStudentId);
        
        if (gradeLevel !== currentGradeLevel) {
          setCurrentGradeLevel(gradeLevel);
        }
        
        setSubjects(studentSubjects.map(mapDatabaseSubjectToSubject));
      } else {
        // For regular users (students) or teachers viewing their own data,
        // get the user's grade level and fetch subjects for that grade level
        if (!isTeacher && !isInitialLoadComplete) {
          const gradeLevel = await fetchUserGradeLevel();
          if (gradeLevel !== currentGradeLevel) {
            setCurrentGradeLevel(gradeLevel);
          }
          console.log("useSubjects.fetchSubjects updated currentGradeLevel to:", gradeLevel);
          completeInitialLoad();
        }

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
          .eq('grade_level', currentGradeLevel) // Critical: Filter subjects by the current grade level
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
  };

  // Initial setup: fetch user grade level and subjects
  useEffect(() => {
    const initialFetch = async () => {
      // Get the user's grade level from profile
      const initialGradeLevel = await fetchUserGradeLevel();
      console.log("Initial grade level fetch:", initialGradeLevel);
      
      if (initialGradeLevel !== currentGradeLevel) {
        setCurrentGradeLevel(initialGradeLevel);
      }
      
      completeInitialLoad();
      await fetchSubjects(true); // Force fetch on initial load
      
      // If user is a teacher, fetch all students
      if (isTeacher) {
        await fetchAllStudents();
      }
    };
    
    initialFetch();
  }, []);

  // Fetch subjects when the grade level changes
  useEffect(() => {
    if (!isInitialLoadComplete) {
      return;
    }
    
    console.log("Grade level changed to:", currentGradeLevel, "- fetching subjects");
    fetchSubjects(true); // Force fetch when grade level changes
  }, [currentGradeLevel]);

  // Fetch subjects when the selected student changes
  useEffect(() => {
    if (!isInitialLoadComplete) {
      return;
    }
    
    if (selectedStudentId) {
      console.log("Selected student changed to:", selectedStudentId, "- fetching subjects");
      fetchStudentSubjects(selectedStudentId).then(({ subjects: studentSubjects }) => {
        setSubjects(studentSubjects.map(mapDatabaseSubjectToSubject));
      });
    } else {
      // If no student is selected anymore, fetch the user's own subjects
      fetchSubjects(true);
    }
  }, [selectedStudentId]);

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
    isTeacher,
    students,
    selectedStudentId,
    selectStudent,
  };
};
