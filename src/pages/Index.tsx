
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSubjects } from "@/hooks/use-subjects";
import { SubjectList } from "@/components/SubjectList";
import { SubjectForm } from "@/components/SubjectForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GradeLevelSelector } from "@/components/GradeLevelSelector";
import Header from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PlusIcon, UploadIcon } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { TeacherStudentSelector } from "@/components/TeacherStudentSelector";
import { Grade } from "@/types";
import { GradeForm } from "@/components/GradeForm";

const Index = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [isAddGradeSheetOpen, setIsAddGradeSheetOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [gradeLevelChangeInProgress, setGradeLevelChangeInProgress] = useState(false);
  const gradeLevelChangeTimeoutRef = useRef<number | null>(null);
  
  const {
    subjects,
    addSubject,
    addGrade,
    updateGrade,
    deleteGrade,
    deleteSubject,
    updateSubject,
    importGradesFromExcel,
    currentGradeLevel,
    setCurrentGradeLevel,
    fetchSubjects,
    isLoading,
    isTeacher,
    students,
    selectedStudentId,
    selectStudent,
  } = useSubjects();

  const handleGradeLevelChange = (newGradeLevel: number) => {
    if (gradeLevelChangeTimeoutRef.current) {
      window.clearTimeout(gradeLevelChangeTimeoutRef.current);
      gradeLevelChangeTimeoutRef.current = null;
    }
    
    if (gradeLevelChangeInProgress || newGradeLevel === currentGradeLevel) {
      return; // Prevent multiple consecutive grade level changes
    }
    
    console.log("Index page handling grade level change to:", newGradeLevel);
    setGradeLevelChangeInProgress(true);
    
    setCurrentGradeLevel(newGradeLevel);
    
    gradeLevelChangeTimeoutRef.current = window.setTimeout(() => {
      fetchSubjects(true);
      setTimeout(() => {
        setGradeLevelChangeInProgress(false);
        gradeLevelChangeTimeoutRef.current = null;
      }, 500);
    }, 100);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentId = params.get('student');
    
    if (studentId && isTeacher && students.find(s => s.id === studentId)) {
      selectStudent(studentId);
    }
  }, [location.search, isTeacher, students, selectStudent]);

  useEffect(() => {
    return () => {
      if (gradeLevelChangeTimeoutRef.current) {
        window.clearTimeout(gradeLevelChangeTimeoutRef.current);
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importGradesFromExcel(file)
      .then(() => {
        setIsUploadSheetOpen(false);
      })
      .catch((error) => {
        toast({
          title: "Fehler beim Import",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handleAddGrade = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setIsAddGradeSheetOpen(true);
  };

  const handleGradeSubmit = (grade: Omit<Grade, 'id'>) => {
    if (selectedSubjectId) {
      addGrade(selectedSubjectId, grade);
      setIsAddGradeSheetOpen(false);
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedStudentName = selectedStudent?.first_name || undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Dashboard" showBackButton={false} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 pt-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {isTeacher 
                    ? "Notenverwaltung (Lehrer)"
                    : "Deine Notenverwaltung"
                  }
                </h1>
                <p className="text-gray-500">
                  {isTeacher
                    ? selectedStudentId 
                      ? `Verwalte Noten von ${selectedStudentName || 'Schüler'}`
                      : "Wähle einen Schüler, um dessen Noten zu verwalten"
                    : "Hier kannst du alle deine Noten einsehen und verwalten."
                  }
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Sheet open={isUploadSheetOpen} onOpenChange={setIsUploadSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <UploadIcon size={16} />
                      <span className="hidden sm:inline">Excel importieren</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Excel-Datei importieren</SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 space-y-6">
                      <p className="text-sm text-gray-600">
                        Wähle eine Excel-Datei zum Importieren deiner Noten aus. Die Datei sollte
                        Spalten für Fachname, Notentyp, Wert, Gewichtung und Datum enthalten.
                      </p>
                      <div className="grid w-full items-center gap-1.5">
                        <label htmlFor="excel-upload" className="text-sm font-medium">
                          Excel-Datei
                        </label>
                        <input
                          id="excel-upload"
                          type="file"
                          accept=".xlsx, .xls"
                          className="py-2 px-3 border rounded-md w-full text-sm"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button className="gap-2">
                      <PlusIcon size={16} />
                      <span className="hidden sm:inline">Fach hinzufügen</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Neues Fach hinzufügen</SheetTitle>
                    </SheetHeader>
                    <div className="mt-8">
                      <SubjectForm 
                        onSubmit={(subject) => {
                          addSubject(subject);
                          setIsSheetOpen(false);
                        }} 
                        currentGradeLevel={currentGradeLevel}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">
                {isTeacher 
                  ? selectedStudentId 
                    ? "Ausgewählte Klassenstufe des Schülers:"
                    : "Wähle einen Schüler, um dessen Noten zu verwalten"
                  : "Aktuelle Klassenstufe:"
                }
              </div>
              <GradeLevelSelector 
                currentGradeLevel={currentGradeLevel} 
                onGradeLevelChange={handleGradeLevelChange}
                disabled={isTeacher && !!selectedStudentId || gradeLevelChangeInProgress || isLoading}
              />
            </div>

            {isTeacher && (
              <TeacherStudentSelector
                students={students}
                selectedStudentId={selectedStudentId}
                onSelectStudent={selectStudent}
                onRefresh={fetchSubjects}
                isLoading={isLoading || gradeLevelChangeInProgress}
              />
            )}

            {isLoading || gradeLevelChangeInProgress ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Lade Fächer...</span>
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 mb-2">Keine Fächer für Klassenstufe {currentGradeLevel} gefunden</p>
                <Button onClick={() => setIsSheetOpen(true)} className="mt-4">
                  <PlusIcon size={16} className="mr-2" />
                  Fach hinzufügen
                </Button>
              </div>
            ) : (
              <SubjectList
                subjects={subjects}
                onAddGrade={addGrade}
                onUpdateGrade={updateGrade}
                onDeleteGrade={deleteGrade}
                onDeleteSubject={deleteSubject}
                onUpdateSubject={updateSubject}
                onAddGradeClick={handleAddGrade}
                studentName={isTeacher ? selectedStudentName : undefined}
              />
            )}
          </div>
        </main>
      </div>
      <Toaster />

      <Sheet open={isAddGradeSheetOpen} onOpenChange={setIsAddGradeSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Note hinzufügen</SheetTitle>
          </SheetHeader>
          <div className="mt-8">
            <GradeForm 
              onSubmit={handleGradeSubmit} 
              onCancel={() => setIsAddGradeSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
