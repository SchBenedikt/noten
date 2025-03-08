
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Subject, Grade } from "@/types";
import { calculateMainSubjectAverages, calculateSecondarySubjectAverages } from "@/lib/calculations";
import { GradeList } from "./GradeList";
import { GradeForm } from "./GradeForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2Icon, Edit2Icon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface SubjectCardProps {
  subject: Subject;
  onAddGrade: (subjectId: string, grade: Omit<Grade, "id">) => void;
  onUpdateGrade: (subjectId: string, gradeId: string, grade: Omit<Grade, "id">) => void;
  onDeleteGrade: (subjectId: string, gradeId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onUpdateSubject?: (subjectId: string, updates: Partial<Subject>) => void;
  isDemo?: boolean;
  isInitiallyOpen?: boolean;
  searchQuery?: string;
  searchType?: "subject" | "grade" | "note";
  studentName?: string;
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
  searchQuery = "",
  searchType = "subject",
  studentName,
}: SubjectCardProps) => {
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isAddGradeSheetOpen, setIsAddGradeSheetOpen] = useState(false);

  const filteredGrades = subject.grades.filter((grade) => {
    if (!searchQuery) return true;

    switch (searchType) {
      case "grade":
        return grade.value.toString().includes(searchQuery);
      case "note":
        return grade.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      default:
        return true;
    }
  });

  const averages =
    subject.type === "main"
      ? calculateMainSubjectAverages(filteredGrades, subject.writtenWeight || 2)
      : calculateSecondarySubjectAverages(filteredGrades);

  const handleWeightChange = (value: string) => {
    if (onUpdateSubject) {
      onUpdateSubject(subject.id, { writtenWeight: Number(value) });
      setIsEditingWeight(false);
    }
  };

  const renderAverages = () => {
    if (subject.type === "main") {
      const mainAverages = averages as ReturnType<typeof calculateMainSubjectAverages>;
      return (
        <>
          <div className="flex items-center gap-2">
            <span>Schulaufgaben: ∅ {mainAverages.written}</span>
            <div className="flex items-center gap-1">
              {isEditingWeight ? (
                <Select defaultValue={subject.writtenWeight?.toString() || "2"} onValueChange={handleWeightChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="×2" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">×1</SelectItem>
                    <SelectItem value="2">×2</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <span>(×{subject.writtenWeight || 2})</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditingWeight(true)} className="h-6 w-6">
                    <Edit2Icon className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div>Mündlich: ∅ {mainAverages.oral}</div>
        </>
      );
    }
    return <div>Mündlich: ∅ {averages.oral}</div>;
  };

  const handleGradeSubmit = (grade: Omit<Grade, "id">) => {
    onAddGrade(subject.id, grade);
    setIsAddGradeSheetOpen(false);
  };

  const renderStudentInfo = () => {
    if (!studentName) return null;
    
    return (
      <div className="text-sm text-gray-500 mt-1">
        Schüler: {studentName}
      </div>
    );
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
            <div>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-xl sm:text-2xl">
                {subject.name}
              </CardTitle>
              {renderStudentInfo()}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-sm space-y-1 sm:space-y-0 sm:text-right bg-gray-50 p-2 rounded-md w-full sm:w-auto">
              {renderAverages()}
              <div className="font-semibold text-base">Gesamt: ∅ {averages.total}</div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isDemo) {
                    setShowLoginDialog(true);
                    return;
                  }
                  setShowDeleteDialog(true);
                }}
                className="hover:bg-red-50"
              >
                <Trash2Icon className="h-4 w-4 text-red-500" />
              </Button>
              <Sheet open={isAddGradeSheetOpen} onOpenChange={setIsAddGradeSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Note hinzufügen</SheetTitle>
                  </SheetHeader>
                  <div className="mt-8">
                    <GradeForm 
                      onSubmit={handleGradeSubmit} 
                      onCancel={() => setIsAddGradeSheetOpen(false)}
                      subjectType={subject.type}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent className="overflow-hidden">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <GradeList
              grades={filteredGrades}
              onUpdateGrade={(gradeId, grade) => onUpdateGrade(subject.id, gradeId, grade)}
              onDeleteGrade={(gradeId) => onDeleteGrade(subject.id, gradeId)}
              isDemo={isDemo}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrierung erforderlich</AlertDialogTitle>
            <AlertDialogDescription>
              Um Noten zu bearbeiten und zu speichern, erstellen Sie bitte ein kostenloses Konto. So können Sie Ihre
              Noten dauerhaft speichern und von überall darauf zugreifen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={() => (window.location.href = "/login")}>Jetzt registrieren</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fach löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie das Fach "{subject.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDeleteSubject(subject.id)} className="bg-red-500 hover:bg-red-600">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
