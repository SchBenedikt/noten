
import { useState, useEffect, useRef } from 'react';
import { Subject } from '@/types';
import { useNavigate } from 'react-router-dom';

import { useAuthStatus } from './use-auth-status';
import { useStudents } from './use-students';
import { useSubjectCrud } from './use-subject-crud';
import { useGradeCrud } from './use-grade-crud';
import { useExcelImport } from './use-excel-import';
import { useGradeLevel } from './use-grade-level';
import { useSubjectFetch } from './use-subject-fetch';

export const useSubjects = () => {
  const navigate = useNavigate();
  const gradeLevelChangeTimeoutRef = useRef<number | null>(null);

  // Extract auth status logic
  const { isTeacher, fetchUserGradeLevel } = useAuthStatus();
  
  // Create state for selected student ID
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Extract grade level management
  const { 
    currentGradeLevel, 
    setCurrentGradeLevel, 
    markGradeLevelSuccess,
    completeInitialLoad,
    isInitialLoadComplete
  } = useGradeLevel({ 
    initialGradeLevel: 5, 
    isTeacher, 
    selectedStudentId 
  });
  
  // Extract subject fetching
  const {
    subjects,
    setSubjects,
    isLoading,
    fetchSubjects
  } = useSubjectFetch({
    currentGradeLevel,
    isTeacher,
    selectedStudentId,
    markGradeLevelSuccess
  });
  
  // Extract student management
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

  useEffect(() => {
    const initialFetch = async () => {
      // Use the grade level stored in the profile on initial load
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

  useEffect(() => {
    // Skip the first render
    if (!isInitialLoadComplete) {
      return;
    }
    
    console.log("Grade level changed to:", currentGradeLevel, "- fetching subjects");
    fetchSubjects(true); // Force fetch when grade level changes
  }, [currentGradeLevel]);

  useEffect(() => {
    // Skip the first render
    if (!isInitialLoadComplete) {
      return;
    }
    
    if (selectedStudentId) {
      console.log("Selected student changed to:", selectedStudentId, "- fetching subjects");
      fetchStudentSubjects(selectedStudentId).then(({ subjects: studentSubjects }) => {
        setSubjects(studentSubjects.map(mapDatabaseSubjectToSubject));
        markGradeLevelSuccess();
      });
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
