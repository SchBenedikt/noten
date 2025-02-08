import { supabase } from "@/integrations/supabase/client";

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
