import { useState } from "react";
import { School } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SchoolSelectorProps {
  schools: School[];
  selectedSchool: string;
  onSchoolSelect: (schoolId: string) => void;
  className?: string;
}

export const SchoolSelector = ({
  schools,
  selectedSchool,
  onSchoolSelect,
  className,
}: SchoolSelectorProps) => {
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");

  const handleAddSchool = async () => {
    if (!newSchoolName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Schulnamen ein",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("schools")
      .insert([{ name: newSchoolName.trim() }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Fehler",
        description: "Schule konnte nicht erstellt werden",
        variant: "destructive",
      });
      return;
    }

    onSchoolSelect(data.id);
    setNewSchoolName("");
    setIsAddingSchool(false);
    
    toast({
      title: "Erfolg",
      description: "Schule wurde erfolgreich erstellt",
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium">Schule</label>
      {!isAddingSchool ? (
        <div className="space-y-2">
          <Select value={selectedSchool} onValueChange={onSchoolSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Wähle deine Schule" />
            </SelectTrigger>
            <SelectContent>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAddingSchool(true)}
          >
            Neue Schule hinzufügen
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Name der Schule"
            value={newSchoolName}
            onChange={(e) => setNewSchoolName(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsAddingSchool(false)}
            >
              Abbrechen
            </Button>
            <Button className="flex-1" onClick={handleAddSchool}>
              Hinzufügen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};