
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, PencilIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface StudentProfile {
  id: string;
  first_name: string | null;
  grade_level: number;
  school_id: string | null;
  school?: {
    name: string;
  };
}

const Students = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // First check if the current user is a teacher
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          navigate('/login');
          return;
        }

        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.session.user.id)
          .single();

        if (profileError || userProfile?.role !== 'teacher') {
          navigate('/');
          return;
        }

        // Fetch all students with their school information
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            grade_level,
            school_id,
            schools:school_id (name)
          `)
          .eq('role', 'student')
          .order('grade_level', { ascending: true });

        if (error) {
          console.error("Error fetching students:", error);
          toast({
            title: "Fehler",
            description: "Fehler beim Laden der Schüler",
            variant: "destructive",
          });
          return;
        }

        // Transform the data to match our interface
        const studentsWithSchools = data.map((student) => ({
          ...student,
          school: student.schools,
        }));

        setStudents(studentsWithSchools);
      } catch (err) {
        console.error("Error in fetchStudents:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [navigate, toast]);

  const handleEditStudent = (studentId: string) => {
    // Navigate to the dashboard with this student selected
    navigate(`/?student=${studentId}`);
  };

  const filteredStudents = students.filter(
    (student) =>
      !searchQuery ||
      (student.first_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      )
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="Schüler" showBackButton={true} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 pt-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Alle Schüler</h1>
              <p className="text-gray-500">
                Hier kannst du alle Schüler sehen und ihre Noten verwalten.
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Schüler</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nach Namen suchen..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    Schüler werden geladen...
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Klassenstufe</TableHead>
                          <TableHead>Schule</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.first_name || "Unbekannter Schüler"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {student.grade_level}. Klasse
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {student.school?.name || "Keine Schule"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditStudent(student.id)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery
                      ? "Keine Schüler mit diesem Namen gefunden"
                      : "Keine Schüler gefunden"}
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

export default Students;
