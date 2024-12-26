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
  const { written, oral, total } = calculateMainSubjectAverages(subject.grades, 2);

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 p-4 sm:p-6 border-b border-gray-100">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-xl sm:text-2xl text-gray-900">
          {subject.name}
          <span className="text-sm font-normal text-gray-500">
            ({subject.type === 'main' ? 'Hauptfach' : 'Nebenfach'})
          </span>
        </CardTitle>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {subject.type === 'main' ? (
            <div className="text-sm space-y-1 sm:space-y-0 sm:text-right bg-purple-50 p-3 rounded-lg w-full sm:w-auto">
              <div className="text-gray-600">Schulaufgaben: <span className="font-medium">{written}</span> (×2)</div>
              <div className="text-gray-600">Mündlich: <span className="font-medium">{oral}</span></div>
              <div className="font-semibold text-base text-purple-700">Gesamt: {total}</div>
            </div>
          ) : (
            <span className="text-lg font-semibold bg-purple-50 p-3 rounded-lg text-purple-700">{average}</span>
          )}
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAddingGrade(!isAddingGrade)}
              className="hover:bg-purple-100"
            >
              {isAddingGrade ? <MinusIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="hover:bg-red-100"
            >
              <Trash2Icon className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        {isAddingGrade && (
          <div className="bg-purple-50/50 p-4 rounded-lg">
            <GradeForm
              onSubmit={(grade) => {
                onAddGrade(subject.id, grade);
                setIsAddingGrade(false);
              }}
              subjectType={subject.type}
            />
          </div>
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