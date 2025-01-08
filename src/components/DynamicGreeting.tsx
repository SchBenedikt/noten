import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DynamicGreeting = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return "Guten Morgen";
    } else if (hour >= 12 && hour < 18) {
      return "Guten Tag";
    } else if (hour >= 18 && hour < 22) {
      return "Guten Abend";
    } else {
      return "Gute Nacht";
    }
  };

  if (!profile?.first_name) return null;

  return (
    <h2 className="text-xl text-gray-700 mb-4">
      {getTimeBasedGreeting()}, {profile.first_name}!
    </h2>
  );
};