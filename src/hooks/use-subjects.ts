// Import the necessary hooks and utilities
import { useState, useCallback, useEffect } from 'react';
import { Grade, Subject, SubjectType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useGradeLevel } from './use-grade-level';
import { useAuthStatus } from './use-auth-status';
import { useStudents } from './use-students';

// Define types for database interactions
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
    type: dbSubject.type as SubjectType, // Cast to SubjectType
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

// Main hook for subject management
export const useSubjects = () => {
  // Initialize state variables
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudentId, selectStudent] = useState<string | null>(null);
  const { toast } = useToast();
  const { isLoggedIn, isTeacher } = useAuthStatus();
  const { students, fetchStudents } = useStudents();

  // Use the useGradeLevel hook to manage the current grade level
  const { currentGradeLevel, updateGradeLevel, completeInitialLoad } = useGradeLevel({
    isTeacher: isLoggedIn ? isTeacher : false,
    selectedStudentId: selectedStudentId || ''
  });

  const fetchSubjects = useCallback(async (params?: { 
    isTeacher?: boolean;
    studentId?: string | null;
    gradeLevel?: number;
  }) => {
    setIsLoading(true);
    
    const isTeacherParam = params?.isTeacher ?? isTeacher;
    const studentId = params?.studentId ?? selectedStudentId;
    const gradeLevel = params?.gradeLevel ?? currentGradeLevel;

    try {
      let query = supabase
        .from('subjects')
        .select(`
          *,
          grades (*)
        `)
        .eq('grade_level', gradeLevel);

      if (isTeacherParam && studentId) {
        query = query.eq('user_id', studentId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('user_id', user.id);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform the data from database format to application format
      const processedSubjects = (data as DatabaseSubject[]).map(transformDbSubjectToSubject);
      
      setSubjects(processedSubjects);
      return processedSubjects;
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Fächer: " + error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [currentGradeLevel, isTeacher, selectedStudentId, toast]);

  // Function to add a new subject
  const addSubject = async (subject: Omit<Subject, 'id' | 'grades'>) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Benutzer nicht angemeldet");

      const { data, error } = await supabase
        .from('subjects')
        .insert([
          {
            ...subject,
            user_id: user.id,
            grade_level: currentGradeLevel,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSubjects([...subjects, transformDbSubjectToSubject(data as DatabaseSubject)]);
      toast({
        title: "Erfolg",
        description: "Fach erfolgreich hinzugefügt",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen des Fachs: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update an existing subject
  const updateSubject = async (subjectId: string, updates: Partial<Omit<Subject, 'id' | 'grades'>>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', subjectId)
        .select()
        .single();

      if (error) throw error;

      setSubjects(subjects.map(subject => {
        if (subject.id === subjectId) {
          return transformDbSubjectToSubject(data as DatabaseSubject);
        }
        return subject;
      }));

      toast({
        title: "Erfolg",
        description: "Fach erfolgreich aktualisiert",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren des Fachs: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a subject
  const deleteSubject = async (subjectId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);

      if (error) throw error;

      setSubjects(subjects.filter(subject => subject.id !== subjectId));
      toast({
        title: "Erfolg",
        description: "Fach erfolgreich gelöscht",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen des Fachs: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a grade to a subject
  const addGrade = async (subjectId: string, grade: Omit<Grade, 'id'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('grades')
        .insert([
          {
            ...grade,
            subject_id: subjectId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSubjects(subjects.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            grades: [...subject.grades, data as Grade],
          };
        }
        return subject;
      }));

      toast({
        title: "Erfolg",
        description: "Note erfolgreich hinzugefügt",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen der Note: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update an existing grade
  const updateGrade = async (gradeId: string, updates: Partial<Grade>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('grades')
        .update(updates)
        .eq('id', gradeId)
        .select()
        .single();

      if (error) throw error;

      setSubjects(subjects.map(subject => {
        return {
          ...subject,
          grades: subject.grades.map(grade => {
            if (grade.id === gradeId) {
              return data as Grade;
            }
            return grade;
          }),
        };
      }));

      toast({
        title: "Erfolg",
        description: "Note erfolgreich aktualisiert",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren der Note: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a grade
  const deleteGrade = async (gradeId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', gradeId);

      if (error) throw error;

      setSubjects(subjects.map(subject => {
        return {
          ...subject,
          grades: subject.grades.filter(grade => grade.id !== gradeId),
        };
      }));

      toast({
        title: "Erfolg",
        description: "Note erfolgreich gelöscht",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen der Note: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const importGradesFromExcel = async (file: File) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const workbook = new Function('return ' + e.target?.result)();
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = workbook.utils.sheet_to_json(worksheet);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Benutzer nicht angemeldet");

        for (const item of jsonData) {
          const subjectName = item['Fachname'] as string;
          const gradeType = item['Notentyp'] as string;
          const gradeValue = item['Wert'] as number;
          const gradeWeight = item['Gewichtung'] as number;
          const gradeDate = item['Datum'] as string;

          // Check if the subject already exists
          let existingSubject = subjects.find(subject => subject.name === subjectName);

          if (!existingSubject) {
            // If the subject doesn't exist, create it
            const newSubject: Omit<Subject, 'id' | 'grades'> = {
              name: subjectName,
              type: gradeType as SubjectType,
              writtenWeight: 50,
              gradeLevel: currentGradeLevel,
            };

            const { data: subjectData, error: subjectError } = await supabase
              .from('subjects')
              .insert([
                {
                  ...newSubject,
                  user_id: user.id,
                },
              ])
              .select()
              .single();

            if (subjectError) throw subjectError;

            existingSubject = transformDbSubjectToSubject(subjectData as DatabaseSubject);
            setSubjects([...subjects, existingSubject]);
          }

          // Create the grade for the subject
          const newGrade: Omit<Grade, 'id'> = {
            subjectId: existingSubject.id,
            value: gradeValue,
            weight: gradeWeight,
            type: gradeType,
            date: gradeDate,
            createdAt: new Date().toISOString(),
            notes: '',
          };

          const { data: gradeData, error: gradeError } = await supabase
            .from('grades')
            .insert([
              {
                ...newGrade,
                subject_id: existingSubject.id,
              },
            ])
            .select()
            .single();

          if (gradeError) throw gradeError;

          // Update the subject with the new grade
          setSubjects(subjects.map(subject => {
            if (subject.id === existingSubject?.id) {
              return {
                ...subject,
                grades: [...subject.grades, gradeData as Grade],
              };
            }
            return subject;
          }));
        }

        toast({
          title: "Erfolg",
          description: "Noten erfolgreich importiert",
        });
      };

      reader.onerror = (error) => {
        throw error;
      };

      reader.readAsText(file);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Fehler beim Importieren der Noten: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchSubjects();
    }
  }, [currentGradeLevel, isLoggedIn, isTeacher, selectedStudentId, fetchSubjects]);

  useEffect(() => {
    const getInitialGradeLevel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('grade_level')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching grade level:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Abrufen der Jahrgangsstufe",
          variant: "destructive",
        });
      } else {
        completeInitialLoad(data?.grade_level);
      }
    };

    if (isLoggedIn) {
      getInitialGradeLevel();
    }
  }, [isLoggedIn, completeInitialLoad]);

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
    updateGradeLevel,
    fetchSubjects,
    isLoading,
    isTeacher,
    students,
    selectedStudentId,
    selectStudent,
  };
};
