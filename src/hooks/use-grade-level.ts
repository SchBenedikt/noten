
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
  const updatePendingRef = useRef(false);

  const updateGradeLevelInDb = async () => {
    // Don't update during initial loading or if we're in teacher mode with a selected student
    if (!initialLoadCompleteRef.current || (isTeacher && selectedStudentId)) {
      return;
    }
    
    // Mark update as pending
    updatePendingRef.current = true;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        updatePendingRef.current = false;
        return;
      }

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
        lastSuccessfulGradeLevelRef.current = currentGradeLevel;
        toast({
          title: "Erfolg",
          description: `Jahrgangsstufe auf ${currentGradeLevel} geändert`,
        });
      }
    } catch (error) {
      console.error("Unexpected error updating grade level:", error);
    } finally {
      updatePendingRef.current = false;
    }
  };

  // Mark initial load as complete
  const completeInitialLoad = () => {
    if (!initialLoadCompleteRef.current) {
      initialLoadCompleteRef.current = true;
      lastSuccessfulGradeLevelRef.current = currentGradeLevel;
    }
  };

  useEffect(() => {
    // Skip during initial loading
    if (!initialLoadCompleteRef.current) {
      return;
    }
    
    updateGradeLevelInDb();
  }, [currentGradeLevel]);

  return {
    currentGradeLevel,
    setCurrentGradeLevel,
    lastSuccessfulGradeLevel: lastSuccessfulGradeLevelRef.current,
    completeInitialLoad,
    isInitialLoadComplete: initialLoadCompleteRef.current,
    isUpdatePending: updatePendingRef.current
  };
};
