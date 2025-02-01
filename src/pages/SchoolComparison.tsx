import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, TrendingUp, AlertCircle } from "lucide-react";
import { calculateSubjectAverage } from "@/lib/calculations";
import { Grade } from "@/types";

interface SchoolSubjectAverage {
  schoolId: string;
  schoolName: string;
  subjectName: string;
  average: number;
}

const SchoolComparison = () => {
  const { data: schoolAverages, isLoading, error } = useQuery({
    queryKey: ["schoolAverages"],
    queryFn: async () => {
      // First, get all schools
      const { data: schools, error: schoolsError } = await supabase
        .from("schools")
        .select("id, name");

      if (schoolsError) {
        throw new Error("Failed to fetch schools");
      }

      if (!schools || schools.length === 0) {
        return [];
      }

      // For each school, get subjects and their grades
      const averages: SchoolSubjectAverage[] = [];

      for (const school of schools) {
        const { data: subjects, error: subjectsError } = await supabase
          .from("subjects")
          .select(`
            id,
            name,
            school_id,
            grades (
              id,
              value,
              weight,
              type,
              date,
              created_at,
              notes
            )
          `)
          .eq("school_id", school.id);

        if (subjectsError) {
          console.error("Error fetching subjects:", subjectsError);
          continue;
        }

        if (subjects) {
          // Calculate average for each subject in this school
          subjects.forEach((subject) => {
            if (subject.grades && subject.grades.length > 0) {
              const average = calculateSubjectAverage(subject.grades as Grade[]);
              if (!isNaN(average)) {
                averages.push({
                  schoolId: school.id,
                  schoolName: school.name,
                  subjectName: subject.name,
                  average: average,
                });
              }
            }
          });
        }
      }

      return averages;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-red-500">Fehler beim Laden der Daten</p>
      </div>
    );
  }

  if (!schoolAverages || schoolAverages.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
          <p className="text-lg">Keine Daten verfügbar</p>
          <p className="text-gray-600">
            Es wurden noch keine Noten für Schulen eingetragen.
          </p>
        </div>
      </div>
    );
  }

  // Group averages by subject
  const subjectGroups = schoolAverages.reduce((groups, item) => {
    if (!groups[item.subjectName]) {
      groups[item.subjectName] = [];
    }
    groups[item.subjectName].push(item);
    return groups;
  }, {} as Record<string, SchoolSubjectAverage[]>);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Award className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">Schulweiter Notenvergleich</h1>
      </div>

      <div className="space-y-8">
        {Object.entries(subjectGroups).map(([subject, schools]) => {
          // Sort schools by average grade (ascending, better grades first)
          const sortedSchools = [...schools].sort((a, b) => a.average - b.average);
          const bestSchool = sortedSchools[0];

          return (
            <div key={subject} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold">{subject}</h2>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schule</TableHead>
                    <TableHead className="text-right">Durchschnitt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSchools.map((school) => (
                    <TableRow key={school.schoolId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {school.schoolName}
                          {school.schoolId === bestSchool.schoolId && (
                            <Award className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {school.average.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SchoolComparison;