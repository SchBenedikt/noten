import { useState } from "react";
import { Plus, HelpCircle } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const handleSelectSchool = async (value: string) => {
    const schoolId = value === "none" ? null : value;
    
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
      description: schoolId ? "Schule wurde geändert" : "Schule wurde entfernt",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Schule</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Wird für schulübergreifende Statistiken genutzt</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Select
        value={currentSchoolId || "none"}
        onValueChange={handleSelectSchool}
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