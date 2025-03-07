
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface StudentProfile {
  id: string;
  first_name: string | null;
  grade_level: number;
  school_id: string | null;
}

interface TeacherStudentSelectorProps {
  students: StudentProfile[];
  selectedStudentId: string | null;
  onSelectStudent: (studentId: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const TeacherStudentSelector = ({
  students,
  selectedStudentId,
  onSelectStudent,
  onRefresh,
  isLoading
}: TeacherStudentSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter(student => 
    !searchQuery || 
    (student.first_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Schüler/innen
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onRefresh} 
            disabled={isLoading}
            title="Liste aktualisieren"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nach Name suchen..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredStudents.length > 0 ? (
            <ScrollArea className="h-[180px] rounded-md border">
              <div className="p-4 grid gap-2">
                {filteredStudents.map((student) => (
                  <Button
                    key={student.id}
                    variant={selectedStudentId === student.id ? "default" : "outline"}
                    className="justify-start h-auto py-2"
                    onClick={() => onSelectStudent(student.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="font-medium truncate">
                        {student.first_name || "Unbekannt"}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {student.grade_level}. Klasse
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery 
                ? "Keine Schüler mit diesem Namen gefunden" 
                : "Keine Schüler in deinen Klassen gefunden"}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            {students.length} Schüler/innen in deinen Klassen
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
