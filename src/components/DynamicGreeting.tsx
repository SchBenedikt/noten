import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from 'react';

const greetings = [
  { message: "Guten Morgen", emoji: "☀️" },
  { message: "Guten Tag", emoji: "🌞" },
  { message: "Guten Abend", emoji: "🌜" },
  { message: "Gute Nacht", emoji: "🌙" },
  { message: "Hallo", emoji: "👋" },
  { message: "Willkommen zurück", emoji: "😊" },
  { message: "Schön dich zu sehen", emoji: "👀" },
  { message: "Wie geht's?", emoji: "🤔" },
  { message: "Alles klar?", emoji: "👌" },
  { message: "Hey", emoji: "🙌" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return greetings[0];
  if (hour < 18) return greetings[1];
  if (hour < 22) return greetings[2];
  return greetings[3];
};

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

  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (!profile?.first_name) return null;

  return (
    <div className="text-xl font-semibold">
      {greeting.message}, {profile.first_name}! {greeting.emoji}
      <hr className="my-4" />
    </div>
  );
};