import { Subject, Grade } from '@/types';
import { SubjectCard } from './SubjectCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { calculateNumberOfSubjects, calculateNumberOfGrades, calculateAverageGradesPerSubject } from '@/lib/calculations';

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

  const mainSubjectsSummary = {
    numberOfSubjects: calculateNumberOfSubjects(mainSubjects),
    numberOfGrades: calculateNumberOfGrades(mainSubjects),
    averageGradesPerSubject: calculateAverageGradesPerSubject(mainSubjects)
  };

  const secondarySubjectsSummary = {
    numberOfSubjects: calculateNumberOfSubjects(secondarySubjects),
    numberOfGrades: calculateNumberOfGrades(secondarySubjects),
    averageGradesPerSubject: calculateAverageGradesPerSubject(secondarySubjects)
  };

  return (
    <div className="space-y-6">
      {mainSubjects.length > 0 && (
        <Collapsible>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold mb-4">Hauptfächer</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
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
          </CollapsibleContent>
          <div className="bg-gray-100 p-4 rounded-lg mt-4">
            <p>Anzahl der Fächer: {mainSubjectsSummary.numberOfSubjects}</p>
            <p>Anzahl der Noten: {mainSubjectsSummary.numberOfGrades}</p>
            <p>Durchschnittliche Anzahl an Noten pro Fach: {mainSubjectsSummary.averageGradesPerSubject}</p>
          </div>
        </Collapsible>
      )}
      {secondarySubjects.length > 0 && (
        <Collapsible>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold mb-4">Nebenfächer</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
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
          </CollapsibleContent>
          <div className="bg-gray-100 p-4 rounded-lg mt-4">
            <p>Anzahl der Fächer: {secondarySubjectsSummary.numberOfSubjects}</p>
            <p>Anzahl der Noten: {secondarySubjectsSummary.numberOfGrades}</p>
            <p>Durchschnittliche Anzahl an Noten pro Fach: {secondarySubjectsSummary.averageGradesPerSubject}</p>
          </div>
        </Collapsible>
      )}
    </div>
  );
};
