
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export type AchievementType = 
  | 'first_grade'
  | 'grade_streak'
  | 'perfect_grade'
  | 'improvement'
  | 'subject_master'
  | 'grade_collector'
  | 'subject_collector';

export interface Achievement {
  id: string;
  subject_id?: string;
  type: AchievementType;
  earned_at: string;
  user_id: string;
  school_year: number;
  subject_name?: string;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        navigate('/login');
        return;
      }

      // Fetch achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('earned_at', { ascending: false });

      if (achievementsError) {
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Achievements",
          variant: "destructive",
        });
        setError(achievementsError.message);
        return;
      }

      // If we have achievements with subject_ids, fetch the subject names
      const achievementsWithSubjects = [...(achievementsData || [])];
      
      // Create a set of unique subject IDs that we need to fetch
      const subjectIds = new Set<string>();
      achievementsWithSubjects.forEach(achievement => {
        if (achievement.subject_id) {
          subjectIds.add(achievement.subject_id);
        }
      });
      
      // Only fetch subjects if we have any subject_ids
      if (subjectIds.size > 0) {
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', Array.from(subjectIds));
          
        if (subjectsError) {
          console.error('Error fetching subjects:', subjectsError);
        } else if (subjectsData) {
          // Create a lookup map for subjects
          const subjectMap = new Map<string, string>();
          subjectsData.forEach(subject => {
            subjectMap.set(subject.id, subject.name);
          });
          
          // Add subject names to achievements
          const enhancedAchievements = achievementsWithSubjects.map(achievement => {
            if (achievement.subject_id && subjectMap.has(achievement.subject_id)) {
              return {
                ...achievement,
                subject_name: subjectMap.get(achievement.subject_id)
              } as Achievement;
            }
            return achievement as Achievement;
          });
          
          setAchievements(enhancedAchievements);
          return;
        }
      }

      setAchievements(achievementsWithSubjects as Achievement[]);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  return {
    achievements,
    loading,
    error,
    fetchAchievements
  };
};
