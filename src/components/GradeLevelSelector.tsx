
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleGradeLevelChange = async (value: string) => {
    const newGradeLevel = parseInt(value);
    
    // Don't update if the value hasn't changed, component is disabled, or an update is in progress
    if (newGradeLevel === currentGradeLevel || disabled || isUpdating) {
      return;
    }
    
    setIsUpdating(true);
    
    try {
      console.log("GradeLevelSelector changing grade level from:", currentGradeLevel, "to:", newGradeLevel);
      
      // Call the callback to notify parent components
      onGradeLevelChange(newGradeLevel);
    } finally {
      // Add a small delay to prevent rapid changes
      setTimeout(() => {
        setIsUpdating(false);
      }, 500);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Klassenstufe:</span>
      <Select
        value={currentGradeLevel.toString()}
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
