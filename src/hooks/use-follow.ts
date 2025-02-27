
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  first_name: string | null;
  grade_level: number;
  following?: boolean;
}

export const useFollow = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [followings, setFollowings] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Lädt alle Benutzer mit follow-Status für den aktuellen Benutzer
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        console.error('Keine Benutzer-Session gefunden');
        return;
      }
      
      console.log("Aktiver Benutzer:", session.session.user.id);
      
      // Hole alle Profile außer dem eigenen
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, grade_level')
        .neq('id', session.session.user.id);
      
      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }
      
      console.log("Gefundene Profile:", profiles?.length || 0, profiles);
      
      // Hole alle folgenden Benutzer für den aktuellen Benutzer
      const { data: followData, error: followError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', session.session.user.id);
      
      if (followError) {
        console.error('Error fetching follows:', followError);
      }
      
      console.log("Folgende Benutzer:", followData?.length || 0);
      
      // Erstelle einen Set mit allen IDs, denen der Benutzer folgt
      const followingIds = new Set(followData?.map(f => f.following_id) || []);
      
      // Markiere Profile, denen der Benutzer folgt
      const usersWithFollowStatus = profiles?.map(profile => ({
        ...profile,
        following: followingIds.has(profile.id)
      })) || [];
      
      console.log("Benutzer mit Follow-Status:", usersWithFollowStatus.length);
      
      setUsers(usersWithFollowStatus);
    } catch (err) {
      console.error('Error in fetchUsers:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Lädt alle Benutzer, denen der aktuelle Benutzer folgt
  const fetchFollowings = async () => {
    try {
      setLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;
      
      // Zuerst holen wir die IDs aller Benutzer, denen der aktuelle Benutzer folgt
      const { data: followData, error: followError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', session.session.user.id);
      
      if (followError) {
        console.error('Error fetching following IDs:', followError);
        return;
      }
      
      if (!followData || followData.length === 0) {
        setFollowings([]);
        setLoading(false);
        return;
      }
      
      // Dann holen wir die Profile-Informationen dieser Benutzer
      const followingIds = followData.map(item => item.following_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, grade_level')
        .in('id', followingIds);
      
      if (profilesError) {
        console.error('Error fetching following profiles:', profilesError);
        return;
      }
      
      // Alle gefolgten Benutzer haben automatisch following=true
      const followingUsers = profiles?.map(profile => ({
        ...profile,
        following: true
      })) || [];
      
      setFollowings(followingUsers);
    } catch (err) {
      console.error('Error in fetchFollowings:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Lädt alle Benutzer, die dem aktuellen Benutzer folgen
  const fetchFollowers = async () => {
    try {
      setLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;
      
      // Zuerst holen wir die IDs aller Benutzer, die dem aktuellen Benutzer folgen
      const { data: followerData, error: followerError } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', session.session.user.id);
      
      if (followerError) {
        console.error('Error fetching follower IDs:', followerError);
        return;
      }
      
      if (!followerData || followerData.length === 0) {
        setFollowers([]);
        setLoading(false);
        return;
      }
      
      // Dann holen wir die Profile-Informationen dieser Benutzer
      const followerIds = followerData.map(item => item.follower_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, grade_level')
        .in('id', followerIds);
      
      if (profilesError) {
        console.error('Error fetching follower profiles:', profilesError);
        return;
      }
      
      // Prüfe, ob der aktuelle Benutzer diesen Followern auch folgt
      const { data: followingData, error: followingError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', session.session.user.id);
      
      if (followingError) {
        console.error('Error checking follows:', followingError);
        return;
      }
      
      // Erstelle einen Set mit allen IDs, denen der Benutzer folgt
      const followingIds = new Set(followingData?.map(f => f.following_id) || []);
      
      // Markiere Profile, denen der Benutzer folgt
      const followersWithStatus = profiles?.map(profile => ({
        ...profile,
        following: followingIds.has(profile.id)
      })) || [];
      
      setFollowers(followersWithStatus);
    } catch (err) {
      console.error('Error in fetchFollowers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Folgen / Entfolgen eines Benutzers
  const toggleFollow = async (userId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;
      
      // Prüfe, ob der Benutzer bereits folgt
      const { data, error: checkError } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', session.session.user.id)
        .eq('following_id', userId);
      
      if (checkError) {
        console.error('Error checking follow status:', checkError);
        return;
      }
      
      // Wenn bereits gefolgt, entfolgen
      if (data && data.length > 0) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', session.session.user.id)
          .eq('following_id', userId);
        
        if (error) {
          console.error('Error unfollowing user:', error);
          toast({
            title: "Fehler",
            description: "Fehler beim Entfolgen des Benutzers",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Entfolgt",
          description: "Du folgst diesem Benutzer nicht mehr",
        });
      } else {
        // Wenn noch nicht gefolgt, folgen
        const { error } = await supabase
          .from('user_follows')
          .insert([
            { 
              follower_id: session.session.user.id, 
              following_id: userId 
            }
          ]);
        
        if (error) {
          console.error('Error following user:', error);
          toast({
            title: "Fehler",
            description: "Fehler beim Folgen des Benutzers",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Erfolgreich",
          description: "Du folgst jetzt diesem Benutzer",
        });
      }
      
      // Aktualisiere die Listen
      fetchUsers();
      fetchFollowings();
      fetchFollowers();
    } catch (err) {
      console.error('Error in toggleFollow:', err);
    }
  };

  return {
    users,
    followings,
    followers,
    loading,
    fetchUsers,
    fetchFollowings,
    fetchFollowers,
    toggleFollow
  };
};
