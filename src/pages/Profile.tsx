import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, KeyRound, GraduationCap, UserCog } from "lucide-react";
import { GradeLevelSelector } from "@/components/GradeLevelSelector";
import { SchoolSelector } from "@/components/SchoolSelector";
import { FirstNameInput } from "@/components/FirstNameInput";
import { useSubjects } from "@/hooks/use-subjects";
import { useQuery } from "@tanstack/react-query";
import { RoleSelector } from "@/components/RoleSelector";
import { Sidebar } from "@/components/Sidebar"; // P635e

const Profile = () => {
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const { setCurrentGradeLevel, fetchSubjects } = useSubjects();

  // Fetch the profile data directly from Supabase
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("school_id, first_name, grade_level, role")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      
      console.log("Profile page fetched grade_level:", data?.grade_level);
      return data;
    },
  });

  const { data: currentSchool } = useQuery({
    queryKey: ["currentSchool", profile?.school_id],
    enabled: !!profile?.school_id,
    queryFn: async () => {
      if (!profile?.school_id) return null;

      const { data, error } = await supabase
        .from("schools")
        .select("id, name")
        .eq("id", profile.school_id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleGradeLevelChange = (newGradeLevel: number) => {
    console.log("Profile handling grade level change to:", newGradeLevel);
    setCurrentGradeLevel(newGradeLevel);
    fetchSubjects();
  };

  const handleRoleChange = async (newRole: 'student' | 'teacher') => {
    if (newRole === profile?.role) return;
    
    setIsUpdatingRole(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Benutzer nicht angemeldet");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) {
        console.error("Fehler beim Aktualisieren der Rolle:", error);
        toast.error("Fehler beim Ändern der Rolle");
        return;
      }
      
      await refetchProfile();
      toast.success(`Rolle wurde auf ${newRole === 'teacher' ? 'Lehrer/in' : 'Schüler/in'} geändert`);
    } catch (error) {
      console.error("Fehler beim Ändern der Rolle:", error);
      toast.error("Unerwarteter Fehler beim Ändern der Rolle");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail 
      });
      
      if (error) {
        if (error.message.includes("email_exists")) {
          toast.error("Diese E-Mail-Adresse wird bereits von einem anderen Benutzer verwendet");
        } else {
          toast.error(error.message || "Ein Fehler ist aufgetreten");
        }
        return;
      }
      
      toast.success("E-Mail-Adresse wurde aktualisiert. Bitte bestätige die Änderung in deinem E-Mail-Postfach.");
      setNewEmail("");
    } catch (error: any) {
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      toast.success("Passwort wurde erfolgreich aktualisiert");
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <Sidebar /> {/* P8d71 */}
        <main className="flex-1 p-4 pt-6 lg:p-8 overflow-auto"> {/* P1854 */}
          <div className="container mx-auto px-4 max-w-2xl">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
              <div>
                <h1 className="text-2xl font-bold mb-6">Profil Einstellungen</h1>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <FirstNameInput
                      currentFirstName={profile?.first_name || null}
                      onFirstNameChange={() => refetchProfile()}
                    />
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <UserCog className="mr-2 h-5 w-5" />
                      Rolle
                    </h2>
                    {profile?.role && (
                      <div className="space-y-4">
                        <RoleSelector 
                          value={profile.role as 'student' | 'teacher'} 
                          onChange={handleRoleChange}
                          disabled={isUpdatingRole}
                        />
                        {isUpdatingRole && (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                            <span className="ml-2 text-sm text-gray-500">Aktualisiere...</span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Als Lehrer/in kannst du die Noten deiner Schüler/innen verwalten.
                          Als Schüler/in kannst du deine eigenen Noten verwalten.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Klassenstufe
                    </h2>
                    {profile?.grade_level && (
                      <GradeLevelSelector
                        currentGradeLevel={profile.grade_level}
                        onGradeLevelChange={handleGradeLevelChange}
                      />
                    )}
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <SchoolSelector
                      currentSchoolId={currentSchool?.id ?? null}
                      onSchoolChange={() => refetchProfile()}
                    />
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <Mail className="mr-2 h-5 w-5" />
                      E-Mail-Adresse ändern
                    </h2>
                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                      <div>
                        <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          Neue E-Mail-Adresse
                        </label>
                        <Input
                          id="newEmail"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          required
                          placeholder="neue@email.de"
                        />
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        E-Mail-Adresse aktualisieren
                      </Button>
                    </form>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <KeyRound className="mr-2 h-5 w-5" />
                      Passwort ändern
                    </h2>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Neues Passwort
                        </label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="Neues Passwort"
                          minLength={6}
                        />
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        Passwort aktualisieren
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
