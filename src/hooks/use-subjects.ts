
import { useState, useEffect, useRef } from 'react';
import { Subject, Grade, SubjectType, GradeType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { createDemoExcel, parseExcelFile } from '@/utils/import';

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

interface StudentProfile {
  id: string;
  first_name: string | null;
  grade_level: number;
  school_id: string | null;
}

const mapDatabaseSubjectToSubject = (dbSubject: DatabaseSubject): Subject => ({
  id: dbSubject.id,
  name: dbSubject.name,
  type: dbSubject.type as SubjectType,
  writtenWeight: dbSubject.written_weight || undefined,
  grade_level: dbSubject.grade_level,
  grades: dbSubject.grades.map(mapDatabaseGradeToGrade),
});

const mapDatabaseGradeToGrade = (dbGrade: DatabaseGrade): Grade => ({
  id: dbGrade.id,
  value: dbGrade.value,
  weight: dbGrade.weight,
  type: dbGrade.type as GradeType,
  date: dbGrade.date,
  notes: dbGrade.notes,
});

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentGradeLevel, setCurrentGradeLevel] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const navigate = useNavigate();
  const isFetchingRef = useRef(false);
  const lastFetchParamsRef = useRef({ isTeacher: false, studentId: null, gradeLevel: 5 });
  const initialLoadCompleteRef = useRef(false);
  const lastSuccessfulGradeLevelRef = useRef<number | null>(null);

  const fetchUserGradeLevel = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        return 5; // Default grade level if not logged in
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('grade_level, role')
        .eq('id', session.session.user.id)
        .single();

      if (error) {
        console.error("Error fetching grade level:", error);
        return 5;
      }

      // Check if user is a teacher
      if (profileData?.role === 'teacher') {
        setIsTeacher(true);
        await fetchAllStudents();
      }

      console.log("Fetched user grade level:", profileData?.grade_level);
      return profileData?.grade_level || 5;
    } catch (error) {
      console.error("Error in fetchUserGradeLevel:", error);
      return 5;
    }
  };

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
      
      // Only auto-select the first student if no student is selected yet
      if (!selectedStudentId && studentsData?.length > 0) {
        setSelectedStudentId(studentsData[0].id);
      }
    } catch (error) {
      console.error("Error in fetchAllStudents:", error);
    }
  };

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

      // When a teacher has selected a student, use the student's data
      if (isTeacher && selectedStudentId) {
        await fetchStudentSubjects(selectedStudentId);
      } else {
        // Get the current grade level from the database only if we're not a teacher viewing a student
        if (!isTeacher && !initialLoadCompleteRef.current) {
          const gradeLevel = await fetchUserGradeLevel();
          if (gradeLevel !== currentGradeLevel) {
            setCurrentGradeLevel(gradeLevel);
          }
          console.log("useSubjects.fetchSubjects updated currentGradeLevel to:", gradeLevel);
          initialLoadCompleteRef.current = true;
        }

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
        lastSuccessfulGradeLevelRef.current = currentGradeLevel;
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
        return;
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
        return;
      }

      console.log("Fetched student subjects:", subjectsData?.length || 0, "for grade level:", studentData.grade_level);
      setSubjects((subjectsData || []).map(mapDatabaseSubjectToSubject));
      lastSuccessfulGradeLevelRef.current = studentData.grade_level;
    } catch (error) {
      console.error("Error fetching student subjects:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Schülerdaten",
        variant: "destructive",
      });
    }
  };

  const selectStudent = async (studentId: string) => {
    if (studentId === selectedStudentId) {
      return; // Skip if already selected
    }
    
    setSelectedStudentId(studentId);
    await fetchStudentSubjects(studentId);
  };

  const addSubject = async (newSubject: Omit<Subject, 'id' | 'grades'>): Promise<Subject> => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user) {
      navigate('/login');
      throw new Error('Not authenticated');
    }

    const targetUserId = isTeacher && selectedStudentId ? selectedStudentId : session.session.user.id;
    
    // Make sure we're using the current grade level
    const targetGradeLevel = newSubject.grade_level || currentGradeLevel;
    console.log("Adding subject with grade level:", targetGradeLevel);

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

    // Only add to the subjects state if it matches the current grade level
    if (data.grade_level === currentGradeLevel) {
      setSubjects([...subjects, newSubjectWithGrades]);
    }
    
    toast({
      title: "Erfolg",
      description: "Fach wurde erfolgreich erstellt",
    });

    return newSubjectWithGrades;
  };

  const addGrade = async (subjectId: string, grade: Omit<Grade, 'id'>) => {
    try {
      // First, get the subject to determine the user_id (student)
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) {
        toast({
          title: "Fehler",
          description: "Das ausgewählte Fach wurde nicht gefunden",
          variant: "destructive",
        });
        return;
      }

      // Insert the grade
      const { data, error } = await supabase
        .from('grades')
        .insert({
          subject_id: subjectId,
          value: grade.value,
          weight: grade.weight,
          type: grade.type,
          date: grade.date,
          notes: grade.notes,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding grade:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Hinzufügen der Note: " + error.message,
          variant: "destructive",
        });
        return;
      }

      // If teacher is adding a grade for a student, try to add achievements manually
      // instead of relying on the database trigger that might be blocked by RLS
      if (isTeacher && selectedStudentId) {
        try {
          // Get current school year
          const date = new Date(grade.date);
          const currentSchoolYear = date.getMonth() < 7 
            ? date.getFullYear() - 1 
            : date.getFullYear();
          
          // Try to add first grade achievement if needed
          const { error: achievementError } = await supabase
            .from('achievements')
            .insert({
              user_id: selectedStudentId,
              type: 'first_grade',
              school_year: currentSchoolYear,
              subject_id: subjectId
            })
            .select()
            .single();
            
          // Ignore errors for achievements since they might already exist (duplicate key)
          if (achievementError && !achievementError.message.includes('duplicate key')) {
            console.log("Info: Achievement not added:", achievementError);
          }
          
          // For perfect grade (1.0)
          if (grade.value === 1.0) {
            await supabase
              .from('achievements')
              .insert({
                user_id: selectedStudentId,
                type: 'perfect_grade',
                school_year: currentSchoolYear,
                subject_id: subjectId
              })
              .select();
          }
        } catch (achievementError) {
          console.log("Info: Error adding achievements, but continuing:", achievementError);
          // We don't want to fail the grade creation if achievements can't be added
        }
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
    } catch (error) {
      console.error("Unexpected error in addGrade:", error);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  const updateGrade = async (subjectId: string, gradeId: string, updatedGrade: Omit<Grade, 'id'>) => {
    const { error } = await supabase
      .from('grades')
      .update({
        value: updatedGrade.value,
        weight: updatedGrade.weight,
        type: updatedGrade.type,
        date: updatedGrade.date,
        notes: updatedGrade.notes,
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

  const importGradesFromExcel = async (file: File) => {
    try {
      const { subjects: importedSubjects } = await parseExcelFile(file);
      
      for (const [name, data] of importedSubjects.entries()) {
        const subject: Omit<Subject, 'id' | 'grades'> = {
          name,
          type: data.type,
          grade_level: currentGradeLevel,
          writtenWeight: data.type === 'main' ? 2 : undefined
        };
        
        await addSubject(subject).then(async (newSubject) => {
          for (const grade of data.grades) {
            await addGrade(newSubject.id, grade);
          }
        });
      }
      
      toast({
        title: "Import erfolgreich",
        description: "Alle Noten wurden erfolgreich importiert",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Import",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      // Use the grade level stored in the profile on initial load
      const initialGradeLevel = await fetchUserGradeLevel();
      console.log("Initial grade level fetch:", initialGradeLevel);
      if (initialGradeLevel !== currentGradeLevel) {
        setCurrentGradeLevel(initialGradeLevel);
      }
      initialLoadCompleteRef.current = true;
      await fetchSubjects(true); // Force fetch on initial load
    };
    
    initialFetch();
  }, []);

  useEffect(() => {
    // Skip the first render
    if (!initialLoadCompleteRef.current) {
      return;
    }
    
    console.log("Grade level changed to:", currentGradeLevel, "- fetching subjects");
    fetchSubjects(true); // Force fetch when grade level changes
  }, [currentGradeLevel]);

  useEffect(() => {
    // Skip the first render
    if (!initialLoadCompleteRef.current) {
      return;
    }
    
    if (selectedStudentId) {
      console.log("Selected student changed to:", selectedStudentId, "- fetching subjects");
      fetchStudentSubjects(selectedStudentId);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    const updateGradeLevelInDb = async () => {
      // Don't update during initial loading or if last fetch wasn't successful
      if (isLoading || !initialLoadCompleteRef.current || lastSuccessfulGradeLevelRef.current !== currentGradeLevel) {
        return;
      }
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        return;
      }

      // Only update the grade level if we're not in teacher mode or if no student is selected
      if (!isTeacher || !selectedStudentId) {
        const { error } = await supabase
          .from('profiles')
          .update({ grade_level: currentGradeLevel })
          .eq('id', session.session.user.id);

        if (error) {
          console.error("Error updating grade level:", error);
        } else {
          console.log("Grade level updated in DB:", currentGradeLevel);
        }
      }
    };

    updateGradeLevelInDb();
  }, [currentGradeLevel, isLoading, isTeacher, selectedStudentId]);

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
