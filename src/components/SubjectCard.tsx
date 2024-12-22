import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subject } from '@/types';
import { calculateSubjectAverage } from '@/lib/calculations';
import { GradeList } from './GradeList';
import { GradeForm } from './GradeForm';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, MinusIcon } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  onAddGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => void;
}

export const SubjectCard = ({ subject, onAddGrade }: SubjectCardProps) => {
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const average = calculateSubjectAverage(subject.grades);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          {subject.name}
          <span className="text-sm font-normal text-muted-foreground">
            ({subject.type === 'main' ? 'Hauptfach' : 'Nebenfach'})
          </span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">∅ {average}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAddingGrade(!isAddingGrade)}
          >
            {isAddingGrade ? <MinusIcon /> : <PlusIcon />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingGrade && (
          <GradeForm
            onSubmit={(grade) => {
              onAddGrade(subject.id, grade);
              setIsAddingGrade(false);
            }}
          />
        )}
        <GradeList grades={subject.grades} />
      </CardContent>
    </Card>
  );
};