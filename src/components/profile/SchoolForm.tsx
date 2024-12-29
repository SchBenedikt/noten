import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

export const SchoolForm = () => {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [showNewSchoolInput, setShowNewSchoolInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: schools } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSchoolChange = (value: string) => {
    if (value === "new") {
      setShowNewSchoolInput(true);
      setSelectedSchool("");
    } else {
      setShowNewSchoolInput(false);
      setSelectedSchool(value);
    }
  };

  const createNewSchool = async () => {
    const { data, error } = await supabase
      .from("schools")
      .insert([{ name: newSchoolName }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let schoolId = selectedSchool;

      if (showNewSchoolInput) {
        if (!newSchoolName) {
          toast({
            title: "Fehler",
            description: "Bitte geben Sie einen Schulnamen ein",
            variant: "destructive",
          });
          return;
        }
        schoolId = await createNewSchool();
      }

      const { error } = await supabase
        .from("profiles")
        .update({ school_id: schoolId })
        .eq("id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Schule wurde aktualisiert.",
      });

      setNewSchoolName("");
      setShowNewSchoolInput(false);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="school">Schule</Label>
        <Select onValueChange={handleSchoolChange}>
          <SelectTrigger>
            <SelectValue placeholder="Wähle deine Schule" />
          </SelectTrigger>
          <SelectContent>
            {schools?.map((school) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
            <SelectItem value="new">Neue Schule erstellen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showNewSchoolInput && (
        <div>
          <Label htmlFor="newSchool">Name der neuen Schule</Label>
          <Input
            id="newSchool"
            type="text"
            value={newSchoolName}
            onChange={(e) => setNewSchoolName(e.target.value)}
            required
          />
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Wird aktualisiert..." : "Schule aktualisieren"}
      </Button>
    </form>
  );
};