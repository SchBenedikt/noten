import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface School {
  id: string;
  name: string;
}

interface SchoolSelectorProps {
  currentSchoolId: string | null;
  onSchoolChange: (schoolId: string | null) => void;
}

export const SchoolSelector = ({
  currentSchoolId,
  onSchoolChange,
}: SchoolSelectorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const { toast } = useToast();

  const { data: schools = [], refetch: refetchSchools } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data as School[];
    },
  });

  const handleCreateSchool = async () => {
    if (!newSchoolName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Schulnamen ein",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("schools")
      .insert({ name: newSchoolName.trim(), created_by: user.id });

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen der Schule",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Erfolg",
      description: "Schule wurde erstellt",
    });

    setNewSchoolName("");
    setIsCreating(false);
    refetchSchools();
  };

  const handleSelectSchool = async (schoolId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ school_id: schoolId })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Ändern der Schule",
        variant: "destructive",
      });
      return;
    }

    onSchoolChange(schoolId);
    toast({
      title: "Erfolg",
      description: "Schule wurde geändert",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        {schools.map((school) => (
          <button
            key={school.id}
            onClick={() => handleSelectSchool(school.id)}
            className={`flex items-center justify-between p-2 text-left rounded-lg hover:bg-gray-100 ${
              currentSchoolId === school.id ? "bg-gray-100" : ""
            }`}
          >
            <span>{school.name}</span>
            {currentSchoolId === school.id && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </button>
        ))}
      </div>

      {isCreating ? (
        <div className="space-y-2">
          <Input
            placeholder="Name der Schule"
            value={newSchoolName}
            onChange={(e) => setNewSchoolName(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleCreateSchool}>Erstellen</Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewSchoolName("");
              }}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Neue Schule erstellen
        </Button>
      )}
    </div>
  );
};