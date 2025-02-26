
import { useState, useEffect } from 'react';
import { Subject, Grade } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { SubjectsService } from '@/services/subjects.service';
import { mapDatabaseSubjectToSubject } from '@/types/database';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentGradeLevel, setCurrentGradeLevel] = useState<number>(5);
  const navigate = useNavigate();

  const fetchSubjects = async () => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user) {
      navigate('/login');
      return;
    }

    try {
      // Fetch grade level
      const { data: profileData } = await supabase
        .from('profiles')
        .select('grade_level')
        .single();

      if (profileData) {
        setCurrentGradeLevel(profileData.grade_level);
      }

      // Fetch subjects
      const subjectsData = await SubjectsService.fetchSubjects();
      setSubjects(subjectsData.map(mapDatabaseSubjectToSubject));
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Fächer",
        variant: "destructive",
      });
    }
  };

  const addSubject = async (newSubject: Omit<Subject, 'id' | 'grades'>): Promise<Subject> => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user) {
      navigate('/login');
      throw new Error('Not authenticated');
    }

    try {
      const data = await SubjectsService.createSubject(newSubject, session.session.user.id);
      const newSubjectWithGrades: Subject = {
        id: data.id,
        name: data.name,
        type: data.type,
        writtenWeight: data.written_weight,
        grade_level: data.grade_level,
        grades: []
      };

      setSubjects([...subjects, newSubjectWithGrades]);
      toast({
        title: "Erfolg",
        description: "Fach wurde erfolgreich erstellt",
      });

      return newSubjectWithGrades;
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen des Fachs",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addGrade = async (subjectId: string, grade: Omit<Grade, 'id'>) => {
    try {
      const data = await SubjectsService.addGrade(subjectId, grade);
      
      setSubjects(subjects.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            grades: [...subject.grades, mapDatabaseSubjectToSubject({ 
              ...subject, 
              grades: [data] 
            }).grades[0]],
          };
        }
        return subject;
      }));

      toast({
        title: "Erfolg",
        description: "Note wurde erfolgreich hinzugefügt",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen der Note",
        variant: "destructive",
      });
    }
  };

  const updateGrade = async (subjectId: string, gradeId: string, updatedGrade: Omit<Grade, 'id'>) => {
    try {
      await SubjectsService.updateGrade(gradeId, updatedGrade);

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
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren der Note",
        variant: "destructive",
      });
    }
  };

  const deleteGrade = async (subjectId: string, gradeId: string) => {
    try {
      await SubjectsService.deleteGrade(gradeId);

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
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen der Note",
        variant: "destructive",
      });
    }
  };

  const deleteSubject = async (subjectId: string) => {
    try {
      await SubjectsService.deleteSubject(subjectId);
      setSubjects(subjects.filter(subject => subject.id !== subjectId));
      
      toast({
        title: "Erfolg",
        description: "Fach wurde erfolgreich gelöscht",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen des Fachs",
        variant: "destructive",
      });
    }
  };

  const updateSubject = async (subjectId: string, updates: Partial<Subject>) => {
    try {
      await SubjectsService.updateSubject(subjectId, {
        writtenWeight: updates.writtenWeight,
      });

      setSubjects(subjects.map(subject => 
        subject.id === subjectId 
          ? { ...subject, ...updates }
          : subject
      ));

      toast({
        title: "Erfolg",
        description: "Fach wurde erfolgreich aktualisiert",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren des Fachs",
        variant: "destructive",
      });
    }
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
    fetchSubjects();
  }, []);

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
  };
};
