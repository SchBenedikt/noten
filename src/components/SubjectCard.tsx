import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subject, Grade } from '@/types';
import { calculateMainSubjectAverages, calculateSecondarySubjectAverages } from '@/lib/calculations';
import { GradeList } from './GradeList';
import { GradeForm } from './GradeForm';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, BookOpenIcon, BookIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from 'framer-motion';
import { SubjectActionButtons } from './SubjectActionButtons';
import { SubjectAverages } from './SubjectAverages';

interface SubjectCardProps {
  subject: Subject;
  onAddGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => void;
  onUpdateGrade: (subjectId: string, gradeId: string, grade: Omit<Grade, 'id'>) => void;
  onDeleteGrade: (subjectId: string, gradeId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onUpdateSubject?: (subjectId: string, updates: Partial<Subject>) => void;
  isDemo?: boolean;
  isInitiallyOpen?: boolean;
  searchQuery?: string;
  searchType?: 'subject' | 'grade' | 'note';
}

export const SubjectCard = ({ 
  subject, 
  onAddGrade, 
  onUpdateGrade,
  onDeleteGrade,
  onDeleteSubject,
  onUpdateSubject,
  isDemo = false,
  isInitiallyOpen = false,
  searchQuery = '',
  searchType = 'subject'
}: SubjectCardProps) => {
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const filteredGrades = subject.grades.filter(grade => {
    if (!searchQuery) return true;
    
    switch (searchType) {
      case 'grade':
        return grade.value.toString().includes(searchQuery);
      case 'note':
        return grade.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      default:
        return true;
    }
  });

  const averages = subject.type === 'main' 
    ? calculateMainSubjectAverages(filteredGrades, subject.writtenWeight || 2)
    : calculateSecondarySubjectAverages(filteredGrades);

  const handleWeightChange = (value: string) => {
    if (onUpdateSubject) {
      onUpdateSubject(subject.id, { writtenWeight: Number(value) });
      setIsEditingWeight(false);
    }
  };

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

  const weightSelector = isEditingWeight ? (
    <Select
      defaultValue={subject.writtenWeight?.toString() || "2"}
      onValueChange={handleWeightChange}
    >
      <SelectTrigger className="w-20">
        <SelectValue placeholder="×2" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">×1</SelectItem>
        <SelectItem value="2">×2</SelectItem>
      </SelectContent>
    </Select>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  </motion.div>
                </Button>
              </CollapsibleTrigger>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-xl sm:text-2xl">
                {subject.name}
                <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                  {subject.type === 'main' ? (
                    <BookOpenIcon className="h-4 w-4" />
                  ) : (
                    <BookIcon className="h-4 w-4" />
                  )}
                  ({subject.type === 'main' ? 'Hauptfach' : 'Nebenfach'})
                </span>
              </CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <SubjectAverages
                type={subject.type}
                averages={averages}
                writtenWeight={subject.writtenWeight}
              >
                {weightSelector}
              </SubjectAverages>
              <SubjectActionButtons
                isAddingGrade={isAddingGrade}
                onAddGradeClick={handleGradeAction}
                onDeleteClick={() => {
                  if (isDemo) {
                    setShowLoginDialog(true);
                    return;
                  }
                  setShowDeleteDialog(true);
                }}
                isDemo={isDemo}
              />
            </div>
          </CardHeader>
          <CollapsibleContent>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    {isAddingGrade && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-50 p-4 rounded-lg"
                      >
                        <GradeForm
                          onSubmit={(grade) => {
                            onAddGrade(subject.id, grade);
                            setIsAddingGrade(false);
                          }}
                          subjectType={subject.type}
                        />
                      </motion.div>
                    )}
                    <GradeList 
                      grades={filteredGrades}
                      onUpdateGrade={(gradeId, grade) => onUpdateGrade(subject.id, gradeId, grade)}
                      onDeleteGrade={(gradeId) => onDeleteGrade(subject.id, gradeId)}
                      isDemo={isDemo}
                    />
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>

        <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Registrierung erforderlich</AlertDialogTitle>
              <AlertDialogDescription>
                Um Noten zu bearbeiten und zu speichern, erstellen Sie bitte ein kostenloses Konto. 
                So können Sie Ihre Noten dauerhaft speichern und von überall darauf zugreifen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button onClick={() => window.location.href = '/login'}>
                  Jetzt registrieren
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
    </motion.div>
  );
};