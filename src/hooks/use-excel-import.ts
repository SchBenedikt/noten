
import { toast } from '@/components/ui/use-toast';
import { parseExcelFile } from '@/utils/import';
import { SubjectType, Grade, GradeType } from '@/types';

interface UseExcelImportProps {
  currentGradeLevel: number;
  addSubject: (subject: any) => Promise<any>;
  addGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
}

export const useExcelImport = ({
  currentGradeLevel,
  addSubject,
  addGrade,
}: UseExcelImportProps) => {

  const importGradesFromExcel = async (file: File) => {
    try {
      const { subjects: importedSubjects } = await parseExcelFile(file);
      
      for (const [name, data] of importedSubjects.entries()) {
        const subject = {
          name,
          type: data.type as SubjectType,
          grade_level: currentGradeLevel,
          writtenWeight: data.type === 'main' ? 2 : undefined
        };
        
        await addSubject(subject).then(async (newSubject) => {
          for (const grade of data.grades) {
            // Ensure grade type is properly cast to GradeType
            const typedGrade = {
              ...grade,
              type: grade.type as GradeType
            };
            await addGrade(newSubject.id, typedGrade);
          }
        });
      }
      
      toast({
        title: "Import erfolgreich",
        description: "Alle Noten wurden erfolgreich importiert",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Fehler beim Import",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    importGradesFromExcel
  };
};
