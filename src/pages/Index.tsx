import { useState } from 'react';
import { SubjectForm } from '@/components/SubjectForm';
import { SubjectCard } from '@/components/SubjectCard';
import { Subject, Grade } from '@/types';
import { calculateOverallAverage } from '@/lib/calculations';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const isMobile = useIsMobile();

  const handleAddSubject = (newSubject: Omit<Subject, 'id' | 'grades'>) => {
    setSubjects([
      ...subjects,
      {
        ...newSubject,
        id: crypto.randomUUID(),
        grades: [],
      },
    ]);
  };

  const handleAddGrade = (subjectId: string, grade: Omit<Grade, 'id'>) => {
    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          grades: [...subject.grades, { ...grade, id: crypto.randomUUID() }],
        };
      }
      return subject;
    }));
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(subject => subject.id !== subjectId));
    toast({
      title: "Erfolg",
      description: "Fach wurde erfolgreich gelöscht.",
    });
  };

  const handleUpdateGrade = (subjectId: string, gradeId: string, updatedGrade: Omit<Grade, 'id'>) => {
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
      description: "Note wurde erfolgreich aktualisiert.",
    });
  };

  const handleDeleteGrade = (subjectId: string, gradeId: string) => {
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
      description: "Note wurde erfolgreich gelöscht.",
    });
  };

  const overallAverage = calculateOverallAverage(subjects);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Notenverwaltung</h1>
          {subjects.length > 0 && (
            <p className="text-lg sm:text-xl text-gray-600">
              Gesamtdurchschnitt: <span className="font-semibold">{overallAverage}</span>
            </p>
          )}
        </div>

        <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-[300px,1fr] gap-8'}`}>
          <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Neues Fach</h2>
            <SubjectForm onSubmit={handleAddSubject} />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Meine Fächer</h2>
            {subjects.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <p className="text-center text-gray-500">
                  Noch keine Fächer vorhanden. Fügen Sie Ihr erstes Fach hinzu!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onAddGrade={handleAddGrade}
                    onUpdateGrade={handleUpdateGrade}
                    onDeleteGrade={handleDeleteGrade}
                    onDeleteSubject={handleDeleteSubject}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
