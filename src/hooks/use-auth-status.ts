
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UseAuthStatusResult {
  isTeacher: boolean;
  fetchUserGradeLevel: () => Promise<number>;
}

export const useAuthStatus = (): UseAuthStatusResult => {
  const [isTeacher, setIsTeacher] = useState(false);
  const navigate = useNavigate();

  const fetchUserGradeLevel = async (): Promise<number> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        return 5; // Default grade level if not logged in
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('grade_level, role')
        .eq('id', session.session.user.id)
        .single();

      if (error) {
        console.error("Error fetching grade level:", error);
        return 5;
      }

      // Check if user is a teacher
      if (profileData?.role === 'teacher') {
        setIsTeacher(true);
      }

      console.log("Fetched user grade level:", profileData?.grade_level);
      return profileData?.grade_level || 5;
    } catch (error) {
      console.error("Error in fetchUserGradeLevel:", error);
      return 5;
    }
  };

  return {
    isTeacher,
    fetchUserGradeLevel,
  };
};
