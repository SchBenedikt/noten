import { utils, read } from 'xlsx';
import { Subject, Grade, SubjectType, GradeType } from '@/types';

interface ExcelGrade {
  Fach: string;
  Typ: string;
  Wert: number;
  Gewichtung: number;
  Art: string;
  Datum: string;
  Notizen?: string;
}

export const createDemoExcel = () => {
  const demoData: ExcelGrade[] = [
    {
      Fach: 'Mathematik',
      Typ: 'Hauptfach',
      Wert: 2,
      Gewichtung: 1,
      Art: 'Mündlich',
      Datum: '2024-02-01',
      Notizen: 'Kopfrechnen'
    },
    {
      Fach: 'Mathematik',
      Typ: 'Hauptfach',
      Wert: 1,
      Gewichtung: 2,
      Art: 'Schulaufgabe',
      Datum: '2024-02-15',
      Notizen: 'Bruchrechnen'
    },
    {
      Fach: 'Englisch',
      Typ: 'Hauptfach',
      Wert: 2.5,
      Gewichtung: 1,
      Art: 'Mündlich',
      Datum: '2024-02-10'
    }
  ];

  const worksheet = utils.json_to_sheet(demoData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Noten');
  
  // Generate the file
  const excelBuffer = utils.write_workbook_buffer(workbook);
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const parseExcelFile = async (file: File): Promise<{
  subjects: Map<string, { type: SubjectType; grades: Omit<Grade, 'id'>[] }>;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = utils.sheet_to_json(worksheet) as ExcelGrade[];
        
        const subjects = new Map<string, { type: SubjectType; grades: Omit<Grade, 'id'>[] }>();
        
        jsonData.forEach((row) => {
          const subjectName = row.Fach;
          const subjectType: SubjectType = row.Typ.toLowerCase() === 'hauptfach' ? 'main' : 'secondary';
          const gradeType: GradeType = row.Art.toLowerCase() === 'mündlich' ? 'oral' : 'written';
          
          if (!subjects.has(subjectName)) {
            subjects.set(subjectName, {
              type: subjectType,
              grades: []
            });
          }
          
          const grade: Omit<Grade, 'id'> = {
            value: row.Wert,
            weight: row.Gewichtung,
            type: gradeType,
            date: row.Datum,
            notes: row.Notizen
          };
          
          subjects.get(subjectName)?.grades.push(grade);
        });
        
        resolve({ subjects });
      } catch (error) {
        reject(new Error('Fehler beim Parsen der Excel-Datei'));
      }
    };
    
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
    reader.readAsArrayBuffer(file);
  });
};