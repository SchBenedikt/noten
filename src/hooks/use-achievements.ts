import { Achievement } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useAchievements = () => {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("earned_at", { ascending: false });

      if (error) throw error;

      return data as Achievement[];
    },
  });
};

export const fetchAndCreateMissingAchievements = async () => {
  // Fetch existing achievements
  const { data: existingAchievements, error: fetchError } = await supabase
    .from('achievements')
    .select('*');

  if (fetchError) {
    console.error('Error fetching achievements:', fetchError);
    return;
  }

  // Fetch grades
  const { data: grades, error: gradesError } = await supabase
    .from('grades')
    .select('*');

  if (gradesError) {
    console.error('Error fetching grades:', gradesError);
    return;
  }

  // Check for missing achievements and create them
  const missingAchievements = [];

  // Example: Check for "first_grade" achievement
  if (!existingAchievements.some(a => a.type === 'first_grade') && grades.length > 0) {
    missingAchievements.push({
      type: 'first_grade',
      earned_at: new Date().toISOString(),
      school_year: new Date().getFullYear(),
    });
  }

  // Add more checks for other achievements as needed

  if (missingAchievements.length > 0) {
    const { error: insertError } = await supabase
      .from('achievements')
      .insert(missingAchievements);

    if (insertError) {
      console.error('Error inserting missing achievements:', insertError);
    }
  }
};

export const addAchievement = async (achievement: Achievement) => {
  const { data, error } = await supabase
    .from('achievements')
    .insert([achievement]);

  if (error) {
    console.error('Error adding achievement:', error);
    throw error;
  }

  return data;
};

export const updateAchievement = async (achievement: Achievement) => {
  const { data, error } = await supabase
    .from('achievements')
    .update(achievement)
    .eq('id', achievement.id);

  if (error) {
    console.error('Error updating achievement:', error);
    throw error;
  }

  return data;
};

export const deleteAchievement = async (achievementId: string) => {
  const { data, error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', achievementId);

  if (error) {
    console.error('Error deleting achievement:', error);
    throw error;
  }

  return data;
};
