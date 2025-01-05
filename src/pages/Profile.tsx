import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, KeyRound, GraduationCap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Profile = () => {
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gradeLevel, setGradeLevel] = useState<number>(5);
  const [showGradeLevelDialog, setShowGradeLevelDialog] = useState(false);
  const [newGradeLevel, setNewGradeLevel] = useState<number>(5);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('grade_level')
        .eq('id', session.user.id)
        .single();

      if (error) {
        toast.error("Fehler beim Laden der Profildaten");
        return;
      }

      if (profile) {
        setGradeLevel(profile.grade_level);
        setNewGradeLevel(profile.grade_level);
      }
    };

    fetchProfile();
  }, [navigate]);

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

  const handleUpdateGradeLevel = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // First archive existing subjects
      const { error: archiveError } = await supabase
        .rpc('archive_subjects_for_user', {
          user_uuid: session.user.id
        });

      if (archiveError) {
        toast.error("Fehler beim Archivieren der Fächer");
        return;
      }

      // Then update grade level
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ grade_level: newGradeLevel })
        .eq('id', session.user.id);

      if (updateError) {
        toast.error("Fehler beim Aktualisieren der Klassenstufe");
        return;
      }

      setGradeLevel(newGradeLevel);
      setShowGradeLevelDialog(false);
      toast.success("Klassenstufe wurde erfolgreich aktualisiert");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
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
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Klassenstufe
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Aktuelle Klassenstufe: {gradeLevel}
                  </div>
                  <Button 
                    onClick={() => setShowGradeLevelDialog(true)}
                    variant="outline"
                  >
                    Klassenstufe ändern
                  </Button>
                </div>
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

      <AlertDialog open={showGradeLevelDialog} onOpenChange={setShowGradeLevelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Klassenstufe ändern</AlertDialogTitle>
            <AlertDialogDescription>
              Wenn du die Klassenstufe änderst, werden alle deine aktuellen Fächer archiviert. 
              Du kannst dann neue Fächer für die neue Klassenstufe anlegen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={newGradeLevel.toString()}
              onValueChange={(value) => setNewGradeLevel(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wähle eine Klassenstufe" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 13 }, (_, i) => i + 1).map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    {grade}. Klasse
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateGradeLevel} disabled={isLoading}>
              Klassenstufe ändern
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;