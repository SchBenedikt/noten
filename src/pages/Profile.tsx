import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, KeyRound, GraduationCap, School } from "lucide-react";
import { GradeLevelSelector } from "@/components/GradeLevelSelector";
import { useSubjects } from "@/hooks/use-subjects";
import { SchoolSelector } from "@/components/SchoolSelector";
import { useQuery } from "@tanstack/react-query";

const Profile = () => {
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currentGradeLevel, setCurrentGradeLevel } = useSubjects();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

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

  const handleSchoolSelect = async (schoolId: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({ school_id: schoolId })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Schule wurde erfolgreich aktualisiert");
    } catch (error: any) {
      toast.error("Fehler beim Aktualisieren der Schule");
      console.error("Error updating school:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Klassenstufe
                </h2>
                <GradeLevelSelector
                  currentGradeLevel={currentGradeLevel}
                  onGradeLevelChange={setCurrentGradeLevel}
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <School className="mr-2 h-5 w-5" />
                  Schule
                </h2>
                <SchoolSelector
                  selectedSchoolId={profile?.school_id || null}
                  onSchoolSelect={handleSchoolSelect}
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
    </div>
  );
};

export default Profile;