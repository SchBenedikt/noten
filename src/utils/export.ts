import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string) => {
  const flatData = data.flatMap(subject => 
    subject.Noten.map((grade: any) => ({
      Fach: subject.Fach,
      Typ: subject.Typ,
      Wert: grade.Wert,
      Gewichtung: grade.Gewichtung,
      Art: grade.Art,
      Datum: grade.Datum,
      Notizen: grade.Notizen,
    }))
  ).filter(row => Object.values(row).some(value => value !== undefined));
  
  const worksheet = utils.json_to_sheet(flatData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  writeFile(workbook, filename);
};

export const exportToXLSX = (data: any[], filename: string) => {
  const flatData = data.flatMap(subject => 
    subject.Noten.map((grade: any) => ({
      Fach: subject.Fach,
      Typ: subject.Typ,
      Wert: grade.Wert,
      Gewichtung: grade.Gewichtung,
      Art: grade.Art,
      Datum: grade.Datum,
      Notizen: grade.Notizen,
    }))
  ).filter(row => Object.values(row).some(value => value !== undefined));
  
  const worksheet = utils.json_to_sheet(flatData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  writeFile(workbook, filename);
};

export const exportToPDF = (data: any[], filename: string) => {
  const doc = new jsPDF();
  const tableData = data.flatMap(subject => 
    subject.Noten.map((grade: any) => [
      subject.Fach,
      subject.Typ,
      grade.Wert,
      grade.Gewichtung,
      grade.Art,
      grade.Datum,
      grade.Notizen,
    ])
  ).filter(row => row.some(value => value !== undefined));

  const headers = ['Fach', 'Typ', 'Wert', 'Gewichtung', 'Art', 'Datum', 'Notizen'].filter((header, index) => 
    tableData.some(row => row[index] !== undefined)
  );

  autoTable(doc, {
    head: [headers],
    body: tableData.map(row => row.filter(value => value !== undefined)),
  });

  doc.save(filename);
};
