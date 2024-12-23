import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subject, Grade } from '@/types';
import { calculateSubjectAverage, calculateMainSubjectAverages } from '@/lib/calculations';
import { GradeList } from './GradeList';
import { GradeForm } from './GradeForm';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, MinusIcon, Trash2Icon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SubjectCardProps {
  subject: Subject;
  onAddGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => void;
  onUpdateGrade: (subjectId: string, gradeId: string, grade: Omit<Grade, 'id'>) => void;
  onDeleteGrade: (subjectId: string, gradeId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const SubjectCard = ({ 
  subject, 
  onAddGrade, 
  onUpdateGrade,
  onDeleteGrade,
  onDeleteSubject 
}: SubjectCardProps) => {
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const average = calculateSubjectAverage(subject.grades);
  const { written, oral, total } = calculateMainSubjectAverages(
    subject.grades,
    subject.writtenWeight || 1
  );

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
          {subject.type === 'main' ? (
            <div className="text-sm">
              <div>Schulaufgaben: ∅ {written} {subject.writtenWeight === 2 && '(×2)'}</div>
              <div>Mündlich: ∅ {oral}</div>
              <div className="font-semibold">Gesamt: ∅ {total}</div>
            </div>
          ) : (
            <span className="text-lg font-semibold">∅ {average}</span>
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAddingGrade(!isAddingGrade)}
            >
              {isAddingGrade ? <MinusIcon /> : <PlusIcon />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2Icon className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingGrade && (
          <GradeForm
            onSubmit={(grade) => {
              onAddGrade(subject.id, grade);
              setIsAddingGrade(false);
            }}
            subjectType={subject.type}
          />
        )}
        <GradeList 
          grades={subject.grades} 
          onUpdateGrade={(gradeId, grade) => onUpdateGrade(subject.id, gradeId, grade)}
          onDeleteGrade={(gradeId) => onDeleteGrade(subject.id, gradeId)}
        />
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fach löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie das Fach "{subject.name}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDeleteSubject(subject.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};