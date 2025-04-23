
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect, useRef } from "react";

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
  const prevGradeLevelRef = useRef<number>(currentGradeLevel);
  const changeTimeoutRef = useRef<number | null>(null);

  // Synchronize with parent component when currentGradeLevel changes
  useEffect(() => {
    console.log("GradeLevelSelector received currentGradeLevel:", currentGradeLevel);
    
    // Clear any pending timeouts
    if (changeTimeoutRef.current) {
      window.clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = null;
    }
    
    // Only update internal state if the current grade level has actually changed
    if (currentGradeLevel !== selectedGradeLevel) {
      setSelectedGradeLevel(currentGradeLevel);
      prevGradeLevelRef.current = currentGradeLevel;
    }
  }, [currentGradeLevel]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        window.clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  const handleGradeLevelChange = async (value: string) => {
    const newGradeLevel = parseInt(value);
    
    // Don't update if the value hasn't changed, component is disabled, or an update is in progress
    if (newGradeLevel === selectedGradeLevel || disabled || isUpdating) {
      return;
    }
    
    setIsUpdating(true);
    setSelectedGradeLevel(newGradeLevel);
    
    try {
      console.log("GradeLevelSelector changing grade level from:", selectedGradeLevel, "to:", newGradeLevel);
      
      // Call the callback to notify parent components
      onGradeLevelChange(newGradeLevel);
      
      // Update our reference to the previous value on success
      prevGradeLevelRef.current = newGradeLevel;
    } catch (error) {
      console.error("Fehler beim Ändern der Klassenstufe:", error);
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Ändern der Klassenstufe",
        variant: "destructive",
      });
      
      // Revert to previous value on error
      setSelectedGradeLevel(prevGradeLevelRef.current);
    } finally {
      // Add a small delay to prevent rapid changes
      changeTimeoutRef.current = window.setTimeout(() => {
        setIsUpdating(false);
        changeTimeoutRef.current = null;
      }, 500);
    }
  };

  return (
    <div className="flex items-center gap-2">
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
