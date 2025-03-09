
import { toast } from '@/components/ui/use-toast';
import { parseExcelFile } from '@/utils/import';
import { SubjectType } from '@/types';

interface UseExcelImportProps {
  currentGradeLevel: number;
  addSubject: (subject: any) => Promise<any>;
  addGrade: (subjectId: string, grade: any) => Promise<void>;
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
      return true;
    } catch (error) {
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
