import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { School, GraduationCap, Plus, Trash2 } from "lucide-react";

interface School {
  id: string;
  name: string;
}

interface TeacherClass {
  id: string;
  school_id: string;
  grade_level: number;
  school_name?: string;
}

const formSchema = z.object({
  school_id: z.string().uuid("Bitte wähle eine Schule aus"),
  grade_level: z.coerce.number().min(1).max(13),
});

const TeacherClasses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      school_id: "",
      grade_level: 5,
    },
  });

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'teacher') {
        navigate('/dashboard');
        toast({
          title: "Zugriff verweigert",
          description: "Diese Seite ist nur für Lehrer zugänglich",
          variant: "destructive",
        });
      } else {
        fetchData();
      }
    };

    checkRole();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*');

      if (schoolsError) throw schoolsError;
      setSchools(schoolsData || []);

      // Fetch teacher classes
      const { data: classesData, error: classesError } = await supabase
        .from('teacher_classes')
        .select('*');

      if (classesError) throw classesError;

      // Enrich classes with school names
      const enrichedClasses = await Promise.all((classesData || []).map(async (cls) => {
        const { data: school } = await supabase
          .from('schools')
          .select('name')
          .eq('id', cls.school_id)
          .single();
        
        return {
          ...cls,
          school_name: school?.name
        };
      }));

      setClasses(enrichedClasses);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const teacher_id = session?.session?.user?.id;

      const { data, error } = await supabase
        .from('teacher_classes')
        .insert({
          school_id: values.school_id,
          grade_level: values.grade_level,
          teacher_id: teacher_id,
        })
        .select();

      if (error) throw error;

      // Find school name for the newly created class
      const school = schools.find(s => s.id === values.school_id);
      
      if (data && data[0]) {
        setClasses([...classes, { ...data[0], school_name: school?.name }]);
      }

      toast({
        title: "Erfolg",
        description: "Klasse wurde erfolgreich hinzugefügt",
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding class:", error);
      toast({
        title: "Fehler",
        description: "Klasse konnte nicht hinzugefügt werden",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('teacher_classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      setClasses(classes.filter(c => c.id !== classId));
      
      toast({
        title: "Erfolg",
        description: "Klasse wurde erfolgreich entfernt",
      });
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: "Fehler",
        description: "Klasse konnte nicht entfernt werden",
        variant: "destructive",
      });
    }
  };

  const gradeLevels = Array.from({ length: 13 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Meine Klassen" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Meine Klassen</h1>
                <p className="text-gray-500">
                  Verwalte deine unterrichteten Klassen
                </p>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={16} />
                    <span>Klasse hinzufügen</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neue Klasse hinzufügen</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="school_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schule</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wähle eine Schule" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {schools.map((school) => (
                                  <SelectItem key={school.id} value={school.id}>
                                    {school.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="grade_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Klassenstufe</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Wähle eine Klassenstufe" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {gradeLevels.map((level) => (
                                  <SelectItem key={level} value={level.toString()}>
                                    {level}. Klasse
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Abbrechen
                          </Button>
                        </DialogClose>
                        <Button type="submit">Hinzufügen</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-white shadow-sm animate-pulse">
                      <CardHeader className="h-16" />
                      <CardContent className="h-24" />
                    </Card>
                  ))}
                </>
              ) : classes.length > 0 ? (
                classes.map((cls) => (
                  <Card key={cls.id} className="bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold">
                          {cls.grade_level}. Klasse
                        </CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClass(cls.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <School className="mr-2 h-4 w-4" />
                        {cls.school_name || "Unbekannte Schule"}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Klassenstufe {cls.grade_level}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Du hast noch keine Klassen hinzugefügt. Klicke auf "Klasse hinzufügen", um zu beginnen.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default TeacherClasses;
