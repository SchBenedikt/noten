import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subject, Grade } from '@/types';
import { GradeList } from './GradeList';
import { GradeForm } from './GradeForm';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SubjectAverages } from './SubjectAverages';
import { SubjectDialogs } from './SubjectDialogs';
import { SubjectActions } from './SubjectActions';

interface SubjectCardProps {
  subject: Subject;
  onAddGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => void;
  onUpdateGrade: (subjectId: string, gradeId: string, grade: Omit<Grade, 'id'>) => void;
  onDeleteGrade: (subjectId: string, gradeId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onUpdateSubject?: (subjectId: string, updates: Partial<Subject>) => void;
  isDemo?: boolean;
  isInitiallyOpen?: boolean;
}

export const SubjectCard = ({ 
  subject, 
  onAddGrade, 
  onUpdateGrade,
  onDeleteGrade,
  onDeleteSubject,
  onUpdateSubject,
  isDemo = false,
  isInitiallyOpen = false
}: SubjectCardProps) => {
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleGradeAction = () => {
    if (isDemo) {
      setShowLoginDialog(true);
      return;
    }
    if (!isOpen) {
      setIsOpen(true);
    }
    setIsAddingGrade(!isAddingGrade);
  };

  const handleDeleteClick = () => {
    if (isDemo) {
      setShowLoginDialog(true);
      return;
    }
    setShowDeleteDialog(true);
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild className="overflow-hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-xl sm:text-2xl">
              {subject.name}
              <span className="text-sm font-normal text-muted-foreground">
                ({subject.type === 'main' ? 'Hauptfach' : 'Nebenfach'})
              </span>
            </CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <SubjectAverages
              subject={subject}
              isEditingWeight={isEditingWeight}
              setIsEditingWeight={setIsEditingWeight}
              onUpdateSubject={onUpdateSubject}
            />
            <SubjectActions
              isAddingGrade={isAddingGrade}
              onGradeActionClick={handleGradeAction}
              onDeleteClick={handleDeleteClick}
            />
          </div>
        </CardHeader>
        <CollapsibleContent className="overflow-hidden">
          <CardContent className="space-y-4 p-4 sm:p-6">
            {isAddingGrade && (
              <div className="bg-gray-50 p-4 rounded-lg">
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
              isDemo={isDemo}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <SubjectDialogs
        showLoginDialog={showLoginDialog}
        setShowLoginDialog={setShowLoginDialog}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        subjectName={subject.name}
        onDeleteSubject={() => onDeleteSubject(subject.id)}
      />
    </Card>
  );
};