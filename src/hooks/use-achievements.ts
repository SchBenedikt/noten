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

export const checkAndCreateAwards = async (userId: string) => {
  const { data: awards, error } = await supabase
    .from("awards")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching awards:", error);
    return;
  }

  if (awards.length === 0) {
    await createAwards(userId);
  }
};

export const createAwards = async (userId: string) => {
  const { error } = await supabase
    .from("awards")
    .insert([
      { user_id: userId, type: "first_grade" },
      { user_id: userId, type: "grade_streak" },
      { user_id: userId, type: "perfect_grade" },
      { user_id: userId, type: "improvement" },
      { user_id: userId, type: "subject_master" },
      { user_id: userId, type: "grade_collector" },
      { user_id: userId, type: "subject_collector" },
    ]);

  if (error) {
    console.error("Error creating awards:", error);
  }
};
