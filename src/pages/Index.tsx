import { SubjectForm } from '@/components/SubjectForm';
import { SubjectList } from '@/components/SubjectList';
import { DynamicGreeting } from '@/components/DynamicGreeting';
import { calculateOverallAverage } from '@/lib/calculations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubjects } from '@/hooks/use-subjects';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Subject } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusIcon, MinusIcon, UserCircle, Menu, LogOut, Search, FileText, FileSpreadsheet, File as FilePdf } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GradeForm } from '@/components/GradeForm';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup, CommandSeparator } from '@/components/ui/command';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/export';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Index = () => {
  const {
    subjects,
    addSubject,
    addGrade,
    updateGrade,
    deleteGrade,
    deleteSubject,
    updateSubject,
    currentGradeLevel,
  } = useSubjects();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [startCount, setStartCount] = useState(false);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isGradeSheetOpen, setGradeSheetOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFields, setExportFields] = useState({
    Fach: true,
    Typ: true,
    Wert: true,
    Gewichtung: true,
    Art: true,
    Datum: true,
    Notizen: true,
  });
  const [lastExportFormat, setLastExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv');

  useEffect(() => {
    setStartCount(true);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Abmelden",
        variant: "destructive",
      });
      return;
    }
    navigate('/login');
  };

  const handleUpdateSubject = async (subjectId: string, updates: Partial<Subject>) => {
    await updateSubject(subjectId, updates);
  };

  const onSubjectAdd = async (subject: Omit<Subject, 'id' | 'grades'>) => {
    await addSubject(subject);
  };

  const currentSubjects = subjects.filter(s => s.grade_level === currentGradeLevel);
  const overallAverage = calculateOverallAverage(currentSubjects);
  const totalGrades = currentSubjects.reduce((sum, subject) => sum + subject.grades.length, 0);
  const mainSubjectsCount = currentSubjects.filter(s => s.type === 'main').length;
  const secondarySubjectsCount = currentSubjects.filter(s => s.type === 'secondary').length;

  const MobileMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <UserCircle className="mr-2 h-4 w-4" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const DesktopMenu = () => (
    <div className="hidden md:flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/profile')}
        className="text-gray-700 hover:text-gray-900"
      >
        <UserCircle className="h-5 w-5" />
      </Button>
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Abmelden
      </button>
    </div>
  );

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    const data = currentSubjects.map(subject => ({
      Fach: exportFields.Fach ? subject.name : undefined,
      Typ: exportFields.Typ ? (subject.type === 'main' ? 'Hauptfach' : 'Nebenfach') : undefined,
      Noten: subject.grades.map(grade => ({
        Wert: exportFields.Wert ? grade.value : undefined,
        Gewichtung: exportFields.Gewichtung ? grade.weight : undefined,
        Art: exportFields.Art ? (grade.type === 'oral' ? 'Mündlich' : 'Schulaufgabe') : undefined,
        Datum: exportFields.Datum ? new Date(grade.date).toLocaleDateString() : undefined,
        Notizen: exportFields.Notizen ? grade.notes || '' : undefined,
      })),
    }));

    setLastExportFormat(format);

    switch (format) {
      case 'csv':
        exportToCSV(data, 'noten.csv');
        break;
      case 'xlsx':
        exportToXLSX(data, 'noten.xlsx');
        break;
      case 'pdf':
        exportToPDF(data, 'noten.pdf');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Notenverwaltung</h1>
            {subjects.length > 0 && (
              <p className="text-lg sm:text-xl text-gray-600">
                Gesamtdurchschnitt: <span className="font-semibold">{overallAverage}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MobileMenu />
            <DesktopMenu />
          </div>
        </div>

        <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-[300px,1fr] gap-8'}`}>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <DynamicGreeting />
              <Button variant="outline" size="icon" className="h-10 w-full mt-2" onClick={() => setIsCommandOpen(true)}>
                <Search className="h-5 w-5 mr-2" />
                Command
              </Button>
              <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
                <CommandInput placeholder="Suchen oder erstellen..." />
                <CommandList>
                  <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
                  <CommandGroup heading="Erstellen">
                    <CommandItem onSelect={() => setSheetOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Fach erstellen
                    </CommandItem>
                    <CommandItem onSelect={() => setGradeSheetOpen(true)}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Note hinzufügen
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Exportieren">
                    <CommandItem onSelect={() => { setIsExportDialogOpen(true); setLastExportFormat('csv'); }}>
                      <FileText className="mr-2 h-4 w-4" />
                      Export als CSV
                    </CommandItem>
                    <CommandItem onSelect={() => { setIsExportDialogOpen(true); setLastExportFormat('xlsx'); }}>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Export als XLSX
                    </CommandItem>
                    <CommandItem onSelect={() => { setIsExportDialogOpen(true); setLastExportFormat('pdf'); }}>
                      <FilePdf className="mr-2 h-4 w-4" />
                      Export als PDF
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </CommandDialog>
              <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-full mt-2">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Fach erstellen
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Fach hinzufügen</SheetTitle>
                  </SheetHeader>
                  <SubjectForm
                    onSubmit={(subject) => {
                      onSubjectAdd(subject);
                      setSheetOpen(false);
                    }}
                    currentGradeLevel={currentGradeLevel}
                  />
                </SheetContent>
              </Sheet>
              <Sheet open={isGradeSheetOpen} onOpenChange={setGradeSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-full mt-2">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Note hinzufügen
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Note hinzufügen</SheetTitle>
                  </SheetHeader>
                  <div className="mb-4">
                    <Select
                      value={selectedSubjectId}
                      onValueChange={setSelectedSubjectId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Fach auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentSubjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedSubjectId && (
                    <GradeForm
                      onSubmit={(grade) => {
                        addGrade(selectedSubjectId, grade);
                        setGradeSheetOpen(false);
                      }}
                    />
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="space-y-6">
            <SubjectList
              subjects={currentSubjects}
              onAddGrade={addGrade}
              onUpdateGrade={updateGrade}
              onDeleteGrade={deleteGrade}
              onDeleteSubject={deleteSubject}
              onUpdateSubject={handleUpdateSubject}
            />
          </div>
        </div>
      </div>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Exportieren</DialogTitle>
            <DialogDescription>
              Wählen Sie die Daten aus, die Sie exportieren möchten.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {Object.keys(exportFields).map((field) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  checked={exportFields[field as keyof typeof exportFields]}
                  onCheckedChange={(checked) => setExportFields((prev) => ({
                    ...prev,
                    [field]: checked,
                  }))}
                  id={field}
                />
                <Label htmlFor={field}>{field}</Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleExport(lastExportFormat)}>
              Export als {lastExportFormat.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
