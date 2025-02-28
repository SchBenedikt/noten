
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isUpdating, setIsUpdating] = useState(false);
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

    setIsUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Fehler",
          description: "Benutzer nicht angemeldet",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("schools")
        .insert({ name: newSchoolName.trim(), created_by: user.id })
        .select('*')
        .single();

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
      await refetchSchools();
      
      // Automatisch die neue Schule auswählen
      if (data) {
        await handleSelectSchool(data.id);
      }
    } catch (error) {
      console.error("Fehler beim Erstellen der Schule:", error);
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Erstellen der Schule",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectSchool = async (value: string) => {
    const schoolId = value === "none" ? null : value;
    setIsUpdating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Fehler",
          description: "Benutzer nicht angemeldet",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from("profiles")
        .update({ school_id: schoolId })
        .eq("id", user.id);

      if (error) {
        console.error("Fehler beim Ändern der Schule:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Ändern der Schule",
          variant: "destructive",
        });
        return;
      }

      // Lokalen Zustand aktualisieren
      onSchoolChange(schoolId);
      toast({
        title: "Erfolg",
        description: schoolId ? "Schule wurde geändert" : "Schule wurde entfernt",
      });
    } catch (error) {
      console.error("Fehler beim Ändern der Schule:", error);
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Ändern der Schule",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Schule</h2>

      <Select
        value={currentSchoolId || "none"}
        onValueChange={handleSelectSchool}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Wähle eine Schule" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Keine Schule</SelectItem>
          {schools.map((school) => (
            <SelectItem key={school.id} value={school.id}>
              {school.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isCreating ? (
        <div className="space-y-2">
          <Input
            placeholder="Name der Schule"
            value={newSchoolName}
            onChange={(e) => setNewSchoolName(e.target.value)}
            disabled={isUpdating}
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleCreateSchool}
              disabled={isUpdating}
            >
              {isUpdating ? "Wird erstellt..." : "Erstellen"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewSchoolName("");
              }}
              disabled={isUpdating}
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
          disabled={isUpdating}
        >
          <Plus className="h-4 w-4 mr-2" />
          Neue Schule erstellen
        </Button>
      )}
    </div>
  );
};
