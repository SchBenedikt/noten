
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
import { useState, useEffect } from "react";

interface GradeLevelSelectorProps {
  currentGradeLevel: number;
  onGradeLevelChange: (gradeLevel: number) => void;
  disabled?: boolean;
}

export const GradeLevelSelector = ({
  currentGradeLevel,
  onGradeLevelChange,
  disabled = false,
}: GradeLevelSelectorProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<number>(currentGradeLevel);

  // Synchronize with parent component when currentGradeLevel changes
  useEffect(() => {
    console.log("GradeLevelSelector received currentGradeLevel:", currentGradeLevel);
    if (currentGradeLevel !== selectedGradeLevel) {
      setSelectedGradeLevel(currentGradeLevel);
    }
  }, [currentGradeLevel]);

  const handleGradeLevelChange = async (value: string) => {
    const newGradeLevel = parseInt(value);
    if (newGradeLevel === selectedGradeLevel) {
      return; // Don't update if the value hasn't changed
    }
    
    setIsUpdating(true);
    setSelectedGradeLevel(newGradeLevel); // Update local state immediately
    
    try {
      // Call the callback to notify parent components first
      onGradeLevelChange(newGradeLevel);
      console.log("GradeLevelSelector updated grade level to:", newGradeLevel);
      
      toast({
        title: "Erfolg",
        description: `Klassenstufe wurde auf ${newGradeLevel} geändert`,
      });
    } catch (error) {
      console.error("Fehler beim Ändern der Klassenstufe:", error);
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Ändern der Klassenstufe",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
      <span className="text-sm font-medium">Klassenstufe:</span>
      <Select
        value={selectedGradeLevel.toString()}
        onValueChange={handleGradeLevelChange}
        disabled={isUpdating || disabled}
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
      {isUpdating && (
        <div className="ml-2 w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      )}
    </div>
  );
};
