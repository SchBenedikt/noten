
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
  const lastSuccessfulGradeLevelRef = useRef<number | null>(null);
  const initialLoadCompleteRef = useRef(false);

  const updateGradeLevelInDb = async () => {
    // Don't update during initial loading or if last fetch wasn't successful
    if (!initialLoadCompleteRef.current || 
        lastSuccessfulGradeLevelRef.current !== currentGradeLevel) {
      return;
    }
    
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user) {
      return;
    }

    // Only update the grade level if we're not in teacher mode or if no student is selected
    if (!isTeacher || !selectedStudentId) {
      console.log("Updating grade level in DB to:", currentGradeLevel);
      
      const { error } = await supabase
        .from('profiles')
        .update({ grade_level: currentGradeLevel })
        .eq('id', session.session.user.id);

      if (error) {
        console.error("Error updating grade level:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Aktualisieren der Jahrgangsstufe",
          variant: "destructive",
        });
      } else {
        console.log("Grade level updated in DB successfully:", currentGradeLevel);
        toast({
          title: "Erfolg",
          description: `Jahrgangsstufe auf ${currentGradeLevel} geändert`,
        });
      }
    }
  };

  // Update lastSuccessfulGradeLevel when we know the fetch has completed
  const markGradeLevelSuccess = () => {
    lastSuccessfulGradeLevelRef.current = currentGradeLevel;
  };

  // Mark initial load as complete
  const completeInitialLoad = () => {
    initialLoadCompleteRef.current = true;
  };

  useEffect(() => {
    // Skip during initial loading
    if (!initialLoadCompleteRef.current) {
      return;
    }
    
    updateGradeLevelInDb();
  }, [currentGradeLevel, isTeacher, selectedStudentId]);

  return {
    currentGradeLevel,
    setCurrentGradeLevel,
    markGradeLevelSuccess,
    completeInitialLoad,
    isInitialLoadComplete: initialLoadCompleteRef.current
  };
};
