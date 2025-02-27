
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

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('earned_at', { ascending: false });

      if (error) {
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Achievements",
          variant: "destructive",
        });
        setError(error.message);
        return;
      }

      setAchievements(data || []);
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
