import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartBarIcon, School, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SchoolAverage {
  subject_name: string;
  average_grade: number;
  student_count: number;
}

const SchoolComparison = () => {
  const [averages, setAverages] = useState<SchoolAverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [userGradeLevel, setUserGradeLevel] = useState<number | null>(null);
  const [schoolName, setSchoolName] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id, grade_level, schools(name)')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUserSchoolId(profile.school_id);
        setUserGradeLevel(profile.grade_level);
        setSchoolName(profile.schools?.name || "");
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchAverages = async () => {
      if (!userSchoolId || !userGradeLevel) return;

      try {
        const { data, error } = await supabase
          .rpc('get_school_subject_averages', {
            school_uuid: userSchoolId,
            grade_level_param: userGradeLevel
          });

        if (error) throw error;
        setAverages(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAverages();
  }, [userSchoolId, userGradeLevel]);

  if (!userSchoolId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-6 w-6" />
            Keine Schule ausgewählt
          </CardTitle>
          <CardDescription>
            Bitte wählen Sie zuerst eine Schule in Ihrem Profil aus.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px] mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full bg-muted/10 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <ChartBarIcon className="h-6 w-6" />
            Fehler beim Laden der Daten
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalStudents = averages.length > 0 ? averages[0].student_count : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-6 w-6" />
          <div className="flex-1">
            <CardTitle>{schoolName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>Durchschnittsnoten {userGradeLevel}. Klasse</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                {totalStudents} {totalStudents === 1 ? 'Schüler' : 'Schüler'}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={averages} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="subject_name"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                domain={[1, 6]} 
                reversed
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as SchoolAverage;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">{data.subject_name}</div>
                        <div className="font-medium text-right">∅ {data.average_grade.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          Anzahl Schüler
                        </div>
                        <div className="text-sm text-right text-muted-foreground">
                          {data.student_count}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="average_grade"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolComparison;