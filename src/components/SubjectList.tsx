import { Subject, Grade } from '@/types';
import { SubjectCard } from './SubjectCard';

interface SubjectListProps {
  subjects: Subject[];
  onAddGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  onUpdateGrade: (subjectId: string, gradeId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  onDeleteGrade: (subjectId: string, gradeId: string) => Promise<void>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onUpdateSubject?: (subjectId: string, updates: Partial<Subject>) => Promise<void>;
  isDemo?: boolean;
}

export const SubjectList = ({
  subjects,
  onAddGrade,
  onUpdateGrade,
  onDeleteGrade,
  onDeleteSubject,
  onUpdateSubject,
  isDemo = false
}: SubjectListProps) => {
  if (subjects.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <p className="text-center text-gray-500">
          Noch keine Fächer vorhanden. Fügen Sie Ihr erstes Fach hinzu!
        </p>
      </div>
    );
  }

  const mainSubjects = subjects.filter(subject => subject.type === 'main');
  const secondarySubjects = subjects.filter(subject => subject.type === 'secondary');

  return (
    <div className="space-y-6">
      {mainSubjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Hauptfächer</h2>
          <div className="grid gap-4">
            {mainSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onAddGrade={onAddGrade}
                onUpdateGrade={onUpdateGrade}
                onDeleteGrade={onDeleteGrade}
                onDeleteSubject={onDeleteSubject}
                onUpdateSubject={onUpdateSubject}
                isDemo={isDemo}
              />
            ))}
          </div>
        </div>
      )}
      {secondarySubjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Nebenfächer</h2>
          <div className="grid gap-4">
            {secondarySubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onAddGrade={onAddGrade}
                onUpdateGrade={onUpdateGrade}
                onDeleteGrade={onDeleteGrade}
                onDeleteSubject={onDeleteSubject}
                onUpdateSubject={onUpdateSubject}
                isDemo={isDemo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
