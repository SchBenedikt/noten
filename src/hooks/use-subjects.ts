
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
  }, []);

  // Fetch subjects when the grade level changes
  useEffect(() => {
    if (!isInitialLoadComplete) {
      return;
    }
    
    console.log("Grade level changed to:", currentGradeLevel, "- fetching subjects");
    fetchSubjects(true);
  }, [currentGradeLevel, isInitialLoadComplete, fetchSubjects]);

  // Fetch subjects when the selected student changes
  useEffect(() => {
    if (!isInitialLoadComplete || !isTeacher) {
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
  }, [selectedStudentId, isTeacher, isInitialLoadComplete, fetchStudentSubjects, fetchSubjects]);

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
    updateGradeLevel,
  };
};
