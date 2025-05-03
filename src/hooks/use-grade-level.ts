
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UseGradeLevelProps {
  initialGradeLevel?: number;
  isTeacher: boolean;
  selectedStudentId: string | null;
}

export const useGradeLevel = ({
  initialGradeLevel = 5,
  isTeacher,
  selectedStudentId
}: UseGradeLevelProps) => {
  const [currentGradeLevel, setCurrentGradeLevel] = useState<number>(initialGradeLevel);
  const [isUpdating, setIsUpdating] = useState(false);
  const initialLoadCompleteRef = useRef(false);
  const { toast } = useToast();
  // Add a ref to track the last updated grade level to prevent duplicate updates
  const lastUpdatedLevelRef = useRef<number>(initialGradeLevel);

  // Mark initial load as complete
  const completeInitialLoad = (gradeLevel?: number) => {
    if (!initialLoadCompleteRef.current) {
      initialLoadCompleteRef.current = true;
      
      // If a grade level is provided, set it
      if (gradeLevel !== undefined && gradeLevel !== currentGradeLevel) {
        setCurrentGradeLevel(gradeLevel);
        lastUpdatedLevelRef.current = gradeLevel;
      }
    }
  };

  // Update grade level in local state and in the database
  const updateGradeLevel = async (newGradeLevel: number) => {
    // Don't update if it's the same as the current grade level
    if (newGradeLevel === lastUpdatedLevelRef.current) {
      return;
    }
    
    // Don't update if we're already updating
    if (isUpdating) {
      return;
    }
    
    // Don't update if we're in teacher mode with a selected student
    if (isTeacher && selectedStudentId) {
      setCurrentGradeLevel(newGradeLevel);
      lastUpdatedLevelRef.current = newGradeLevel;
      return;
    }
    
    // Skip if the initial load hasn't completed
    if (!initialLoadCompleteRef.current) {
      setCurrentGradeLevel(newGradeLevel);
      lastUpdatedLevelRef.current = newGradeLevel;
      return;
    }
    
    setIsUpdating(true);
    setCurrentGradeLevel(newGradeLevel);
    lastUpdatedLevelRef.current = newGradeLevel;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        return;
      }

      console.log("Updating grade level in DB to:", newGradeLevel);
      
      const { error } = await supabase
        .from('profiles')
        .update({ grade_level: newGradeLevel })
        .eq('id', session.session.user.id);

      if (error) {
        console.error("Error updating grade level:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Aktualisieren der Jahrgangsstufe",
          variant: "destructive",
        });
      } else {
        console.log("Grade level updated in DB successfully:", newGradeLevel);
        toast({
          title: "Erfolg",
          description: `Jahrgangsstufe auf ${newGradeLevel} geändert`,
        });
      }
    } catch (error) {
      console.error("Unexpected error updating grade level:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    currentGradeLevel,
    updateGradeLevel,
    isUpdating,
    isInitialLoadComplete: initialLoadCompleteRef.current,
    completeInitialLoad
  };
};
