
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, TrashIcon, UsersIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GradeLevelSelector } from "@/components/GradeLevelSelector";
import Header from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface TeacherClass {
  id: string;
  school_id: string;
  grade_level: number;
  teacher_id: string;
  created_at: string;
  school?: {
    id: string;
    name: string;
  };
}

interface School {
  id: string;
  name: string;
}

const TeacherClasses = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchools = async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("id, name");

      if (error) {
        console.error("Error fetching schools:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Schulen",
          variant: "destructive",
        });
        return;
      }

      setSchools(data || []);
      if (data && data.length > 0 && !selectedSchool) {
        setSelectedSchool(data[0].id);
      }
    };

    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("teacher_classes")
          .select(`
            id,
            school_id,
            grade_level,
            teacher_id,
            created_at,
            schools:school_id (
              id,
              name
            )
          `)
          .order("grade_level", { ascending: true });

        if (error) {
          console.error("Error fetching classes:", error);
          toast({
            title: "Fehler",
            description: "Fehler beim Laden der Klassen",
            variant: "destructive",
          });
          return;
        }

        // Map the joined school data to the class objects
        const classesWithSchools = data.map((cls) => ({
          ...cls,
          school: cls.schools,
        }));

        setClasses(classesWithSchools);
      } catch (err) {
        console.error("Error in fetchClasses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
    fetchClasses();
  }, [toast]);

  const handleAddClass = async () => {
    if (!selectedSchool) {
      toast({
        title: "Fehler",
        description: "Bitte wähle eine Schule aus",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the current user's ID
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast({
          title: "Fehler",
          description: "Du musst eingeloggt sein",
          variant: "destructive",
        });
        return;
      }

      const teacherId = sessionData.session.user.id;
      
      const { data, error } = await supabase
        .from("teacher_classes")
        .insert({
          school_id: selectedSchool,
          grade_level: selectedGradeLevel,
          teacher_id: teacherId
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding class:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Hinzufügen der Klasse",
          variant: "destructive",
        });
        return;
      }

      // Add the school information to the new class before adding it to the state
      const newClass = {
        ...data,
        school: schools.find((s) => s.id === selectedSchool),
      };

      setClasses([...classes, newClass]);
      toast({
        title: "Erfolg",
        description: "Klasse wurde erfolgreich hinzugefügt",
      });
    } catch (err) {
      console.error("Error in handleAddClass:", err);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async () => {
    if (!deleteClassId) return;

    try {
      const { error } = await supabase
        .from("teacher_classes")
        .delete()
        .eq("id", deleteClassId);

      if (error) {
        console.error("Error deleting class:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Löschen der Klasse",
          variant: "destructive",
        });
        return;
      }

      setClasses(classes.filter((cls) => cls.id !== deleteClassId));
      setDeleteClassId(null);
      toast({
        title: "Erfolg",
        description: "Klasse wurde erfolgreich gelöscht",
      });
    } catch (err) {
      console.error("Error in handleDeleteClass:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Klassen" showBackButton={true} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 pt-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Deine Klassen</h1>
              <p className="text-gray-500">
                Hier kannst du die Klassen verwalten, für die du als Lehrer
                zuständig bist.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Klasse hinzufügen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="w-full sm:w-1/3">
                    <label className="text-sm font-medium mb-2 block">
                      Schule
                    </label>
                    <Select
                      value={selectedSchool || ""}
                      onValueChange={setSelectedSchool}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Schule auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-1/3">
                    <label className="text-sm font-medium mb-2 block">
                      Klassenstufe
                    </label>
                    <GradeLevelSelector
                      currentGradeLevel={selectedGradeLevel}
                      onGradeLevelChange={setSelectedGradeLevel}
                    />
                  </div>

                  <div className="w-full sm:w-1/3">
                    <Button
                      onClick={handleAddClass}
                      className="w-full"
                      disabled={!selectedSchool}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Klasse hinzufügen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UsersIcon className="h-5 w-5 mr-2" />
                  Deine Klassen
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Schule</TableHead>
                        <TableHead>Klassenstufe</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell>{cls.school?.name || "Unbekannte Schule"}</TableCell>
                          <TableCell>{cls.grade_level}. Klasse</TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteClassId(cls.id)}
                                >
                                  <TrashIcon className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Klasse löschen
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Möchtest du diese Klasse wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDeleteClassId(null)}>
                                    Abbrechen
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteClass}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Löschen
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {isLoading ? "Klassen werden geladen..." : "Noch keine Klassen vorhanden"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default TeacherClasses;
