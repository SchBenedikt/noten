import { useState } from "react";
import { Check, PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface School {
  id: string;
  name: string;
}

interface SchoolSelectorProps {
  selectedSchoolId: string | null;
  onSchoolSelect: (schoolId: string | null) => void;
}

export const SchoolSelector = ({ selectedSchoolId, onSchoolSelect }: SchoolSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [value, setValue] = useState(selectedSchoolId || "");

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

  const { data: selectedSchool } = useQuery({
    queryKey: ["school", selectedSchoolId],
    queryFn: async () => {
      if (!selectedSchoolId) return null;
      const { data, error } = await supabase
        .from("schools")
        .select("name")
        .eq("id", selectedSchoolId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedSchoolId,
  });

  const handleCreateSchool = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("schools")
        .insert([{ 
          name: newSchoolName,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Schule erfolgreich erstellt");
      setDialogOpen(false);
      setNewSchoolName("");
      await refetchSchools();
      
      // Select the newly created school
      setValue(data.id);
      onSchoolSelect(data.id);
    } catch (error: any) {
      toast.error("Fehler beim Erstellen der Schule");
      console.error("Error creating school:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedSchool ? selectedSchool.name : "Wähle deine Schule"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Suche nach einer Schule..." />
            <CommandEmpty>Keine Schule gefunden.</CommandEmpty>
            <CommandGroup>
              {schools.map((school) => (
                <CommandItem
                  key={school.id}
                  value={school.name}
                  onSelect={() => {
                    setValue(school.id);
                    onSchoolSelect(school.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === school.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {school.name}
                </CommandItem>
              ))}
              <CommandItem
                onSelect={() => {
                  setDialogOpen(true);
                  setOpen(false);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Neue Schule erstellen
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Schule erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name der Schule"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
            />
            <Button
              onClick={handleCreateSchool}
              disabled={!newSchoolName.trim()}
              className="w-full"
            >
              Erstellen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};