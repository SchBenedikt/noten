import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FirstNameInputProps {
  currentFirstName: string | null;
  onFirstNameChange: (firstName: string | null) => void;
}

export const FirstNameInput = ({
  currentFirstName,
  onFirstNameChange,
}: FirstNameInputProps) => {
  const [firstName, setFirstName] = useState(currentFirstName || "");
  const { toast } = useToast();

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName || null })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern des Vornamens",
        variant: "destructive",
      });
      return;
    }

    onFirstNameChange(firstName || null);
    toast({
      title: "Erfolg",
      description: "Vorname wurde gespeichert",
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Vorname</h2>
      <div className="flex gap-2">
        <Input
          placeholder="Dein Vorname"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Button onClick={handleSave}>Speichern</Button>
      </div>
    </div>
  );
};