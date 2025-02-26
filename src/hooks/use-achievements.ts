
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
  const navigate = useNavigate();

  const fetchAchievements = async () => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('earned_at', { ascending: false });

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Achievements",
        variant: "destructive",
      });
      return;
    }

    setAchievements(data || []);
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  return {
    achievements,
    fetchAchievements
  };
};
