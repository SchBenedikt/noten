import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, KeyRound, GraduationCap } from "lucide-react";
import { GradeLevelSelector } from "@/components/GradeLevelSelector";
import { SchoolSelector } from "@/components/SchoolSelector";
import { FirstNameInput } from "@/components/FirstNameInput";
import { useSubjects } from "@/hooks/use-subjects";
import { useQuery } from "@tanstack/react-query";

const Profile = () => {
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const { currentGradeLevel, setCurrentGradeLevel } = useSubjects();

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("school_id, first_name, verification_token")
        .eq("id", user.id)
        .single();

      if (error) throw error;
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

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const verificationToken = crypto.randomUUID();
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_token: verificationToken })
        .eq('id', user.id);
      
      if (updateError) throw updateError;

      const { error: emailError } = await supabase.auth.updateUser({ 
        email: newEmail 
      });
      
      if (emailError) {
        if (emailError.message.includes("email_exists")) {
          toast.error("Diese E-Mail-Adresse wird bereits von einem anderen Benutzer verwendet");
        } else {
          toast.error(emailError.message || "Ein Fehler ist aufgetreten");
        }
        return;
      }

      // Send verification email using Supabase Edge Function
      const { error: functionError } = await supabase.functions.invoke('send-verification-email', {
        body: JSON.stringify({
          email: newEmail,
          token: verificationToken,
        })
      });

      if (functionError) {
        throw functionError;
      }
      
      toast.success("E-Mail-Adresse wurde aktualisiert. Bitte bestätige die Änderung in deinem E-Mail-Postfach.");
      setNewEmail("");
    } catch (error: any) {
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsSendingVerification(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const verificationToken = crypto.randomUUID();
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_token: verificationToken })
        .eq('id', user.id);
      
      if (updateError) throw updateError;

      const { error: functionError } = await supabase.functions.invoke('send-verification-email', {
        body: JSON.stringify({
          email: user.email,
          token: verificationToken,
        })
      });

      if (functionError) {
        throw functionError;
      }

      toast.success("Bestätigungs-E-Mail wurde erneut gesendet");
    } catch (error) {
      toast.error("Fehler beim Senden der Bestätigungs-E-Mail");
      console.error('Error:', error);
    } finally {
      setIsSendingVerification(false);
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
                <FirstNameInput
                  currentFirstName={profile?.first_name || null}
                  onFirstNameChange={() => refetchProfile()}
                />
              </div>

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
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      E-Mail-Adresse aktualisieren
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResendVerification}
                      disabled={isSendingVerification}
                    >
                      Bestätigungs-E-Mail erneut senden
                    </Button>
                  </div>
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
