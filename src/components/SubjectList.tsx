import { Subject, Grade } from '@/types';
import { SubjectCard } from './SubjectCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';

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

  const SubjectSection = ({ title, subjects, type }: { title: string; subjects: Subject[]; type: 'main' | 'secondary' }) => {
    if (subjects.length === 0) return null;
    
    return (
      <Collapsible>
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="grid gap-4">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onAddGrade={async (subjectId, grade) => {
                    await onAddGrade(subjectId, grade);
                    // Ensure the Collapsible remains open when a grade is added
                    const collapsible = document.querySelector(`[data-subject-id="${subjectId}"]`);
                    if (collapsible) {
                      collapsible.setAttribute('data-state', 'open');
                    }
                  }}
                  onUpdateGrade={onUpdateGrade}
                  onDeleteGrade={onDeleteGrade}
                  onDeleteSubject={onDeleteSubject}
                  onUpdateSubject={onUpdateSubject}
                  isDemo={isDemo}
                />
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-6">
      <SubjectSection title="Hauptfächer" subjects={mainSubjects} type="main" />
      <SubjectSection title="Nebenfächer" subjects={secondarySubjects} type="secondary" />
    </div>
  );
};
