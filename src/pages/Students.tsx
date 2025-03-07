
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { GraduationCap, Search, School, Star } from "lucide-react";

interface StudentProfile {
  id: string;
  first_name: string | null;
  grade_level: number;
  school_id: string | null;
  school_name?: string;
}

const Students = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
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
        fetchStudents();
      }
    };

    checkRole();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Get current teacher's classes
      const { data: teacherClassesData, error: classesError } = await supabase
        .from('teacher_classes')
        .select('*');

      if (classesError) throw classesError;
      
      if (!teacherClassesData || teacherClassesData.length === 0) {
        setStudents([]);
        setIsLoading(false);
        return;
      }

      // Create filter conditions for each class (school + grade level)
      const filters = teacherClassesData.map(tc => 
        `(school_id.eq.${tc.school_id},grade_level.eq.${tc.grade_level})`
      ).join(',');

      // Get students who match the teacher's classes
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, first_name, grade_level, school_id, role')
        .or(filters)
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Enrich student data with school names
      const schoolIds = [...new Set(studentsData?.map(s => s.school_id).filter(id => id) as string[])];
      
      const { data: schoolsData } = await supabase
        .from('schools')
        .select('id, name')
        .in('id', schoolIds.length > 0 ? schoolIds : ['00000000-0000-0000-0000-000000000000']);
      
      const schoolMap = new Map(schoolsData?.map(s => [s.id, s.name]) || []);

      const enrichedStudents = (studentsData || []).map(student => ({
        ...student,
        school_name: student.school_id ? schoolMap.get(student.school_id) : undefined
      }));

      setStudents(enrichedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Fehler",
        description: "Schüler konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStudentGrades = (studentId: string) => {
    navigate('/dashboard', { state: { selectedStudentId: studentId } });
  };

  // Filter students based on search and active tab
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && student.grade_level.toString() === activeTab;
  });

  // Get unique grade levels for tabs
  const gradeLevels = [...new Set(students.map(s => s.grade_level))].sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Schüler" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Schüler</h1>
              <p className="text-gray-500">
                Alle Schüler in deinen Klassen
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nach Namen suchen..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Alle</TabsTrigger>
                  {gradeLevels.map((level) => (
                    <TabsTrigger key={level} value={level.toString()}>
                      {level}. Klasse
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader className="h-16" />
                          <CardContent className="h-24" />
                        </Card>
                      ))}
                    </div>
                  ) : filteredStudents.length > 0 ? (
                    <ScrollArea className="h-[500px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStudents.map((student) => (
                          <Card key={student.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle>{student.first_name || "Unbekannter Schüler"}</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-4">
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-500">
                                  <GraduationCap className="mr-2 h-4 w-4" />
                                  {student.grade_level}. Klasse
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <School className="mr-2 h-4 w-4" />
                                  {student.school_name || "Keine Schule"}
                                </div>
                                <Button 
                                  variant="outline" 
                                  className="w-full mt-2"
                                  onClick={() => handleViewStudentGrades(student.id)}
                                >
                                  <Star className="mr-2 h-4 w-4" />
                                  Noten ansehen
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      {students.length === 0 ? 
                        "Du hast noch keine Klassen oder keine Schüler in deinen Klassen." : 
                        "Keine Schüler gefunden, die deiner Suche entsprechen."}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default Students;
