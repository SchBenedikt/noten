import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartBarIcon } from 'lucide-react';

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id, grade_level')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUserSchoolId(profile.school_id);
        setUserGradeLevel(profile.grade_level);
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
      } catch (err) {
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
          <CardTitle>Keine Schule ausgewählt</CardTitle>
          <CardDescription>
            Bitte wählen Sie zuerst eine Schule in Ihrem Profil aus.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fehler</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-6 w-6" />
          <div>
            <CardTitle>Schulweiter Vergleich</CardTitle>
            <CardDescription>
              Durchschnittsnoten aller Schüler in der {userGradeLevel}. Klasse
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={averages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject_name" />
              <YAxis domain={[1, 6]} reversed />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as SchoolAverage;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">{data.subject_name}</div>
                        <div className="font-medium text-right">∅ {data.average_grade}</div>
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
                fill="var(--primary)"
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