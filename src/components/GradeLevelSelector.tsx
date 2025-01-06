import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GradeLevelSelectorProps {
  currentGradeLevel: number;
  onGradeLevelChange: (gradeLevel: number) => void;
}

export const GradeLevelSelector = ({
  currentGradeLevel,
  onGradeLevelChange,
}: GradeLevelSelectorProps) => {
  const { toast } = useToast();

  const handleGradeLevelChange = async (value: string) => {
    const newGradeLevel = parseInt(value);
    
    const { error } = await supabase
      .from('profiles')
      .update({ grade_level: newGradeLevel })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Ändern der Klassenstufe",
        variant: "destructive",
      });
      return;
    }

    onGradeLevelChange(newGradeLevel);
    toast({
      title: "Erfolg",
      description: `Klassenstufe wurde auf ${newGradeLevel} geändert`,
    });
  };

  return (
    <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
      <span className="text-sm font-medium">Klassenstufe:</span>
      <Select
        value={currentGradeLevel.toString()}
        onValueChange={handleGradeLevelChange}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Wähle eine Klasse" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 13 }, (_, i) => i + 1).map((grade) => (
            <SelectItem key={grade} value={grade.toString()}>
              {grade}. Klasse
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};