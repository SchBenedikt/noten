import { useState } from 'react';
import { SubjectForm } from '@/components/SubjectForm';
import { SubjectCard } from '@/components/SubjectCard';
import { Subject, Grade } from '@/types';
import { calculateOverallAverage } from '@/lib/calculations';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

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

  const overallAverage = calculateOverallAverage(subjects);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Notenverwaltung</h1>
          {subjects.length > 0 && (
            <p className="text-xl text-gray-600">
              Gesamtdurchschnitt: <span className="font-semibold">{overallAverage}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Neues Fach</h2>
            <SubjectForm onSubmit={handleAddSubject} />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Meine Fächer</h2>
            {subjects.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Noch keine Fächer vorhanden. Fügen Sie Ihr erstes Fach hinzu!
              </p>
            ) : (
              <div className="grid gap-6">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onAddGrade={handleAddGrade}
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