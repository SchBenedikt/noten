import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<{ id: string; name: string; }[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [showNewSchoolInput, setShowNewSchoolInput] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    loadSchools();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadSchools = async () => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error loading schools:', error);
      toast.error("Fehler beim Laden der Schulen");
      return;
    }

    setSchools(data || []);
  };

  const handleCreateSchool = async () => {
    if (!newSchoolName.trim()) {
      toast.error("Bitte geben Sie einen Schulnamen ein");
      return;
    }

    const { data, error } = await supabase
      .from('schools')
      .insert([{ name: newSchoolName.trim() }])
      .select()
      .single();

    if (error) {
      console.error('Error creating school:', error);
      toast.error("Fehler beim Erstellen der Schule");
      return;
    }

    toast.success("Schule erfolgreich erstellt");
    setNewSchoolName("");
    setShowNewSchoolInput(false);
    await loadSchools();
    setSelectedSchool(data.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Notenverwaltung</h1>
          <p className="text-sm text-muted-foreground">
            Melde dich an, um deine Noten zu verwalten
          </p>
        </div>

        <div className="space-y-4">
          {!showNewSchoolInput ? (
            <div className="space-y-2">
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Wähle deine Schule" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowNewSchoolInput(true)}
              >
                Neue Schule erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Name der Schule"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewSchoolInput(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateSchool}
                >
                  Erstellen
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary) / 0.9)',
                }
              }
            },
            className: {
              container: 'space-y-4',
              button: 'w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors',
              input: 'w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              label: 'block text-sm font-medium text-foreground mb-1',
              anchor: 'text-sm text-primary hover:text-primary/90',
              divider: 'text-muted-foreground',
              message: 'text-sm text-muted-foreground',
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-Mail Adresse',
                password_label: 'Passwort',
                button_label: 'Anmelden',
                loading_button_label: 'Wird angemeldet...',
                social_provider_text: 'Anmelden mit {{provider}}',
                link_text: 'Bereits registriert? Anmelden',
              },
              sign_up: {
                email_label: 'E-Mail Adresse',
                password_label: 'Passwort',
                button_label: 'Registrieren',
                loading_button_label: 'Registrierung...',
                social_provider_text: 'Registrieren mit {{provider}}',
                link_text: 'Noch kein Konto? Registrieren',
              },
              magic_link: {
                email_input_label: 'E-Mail Adresse',
                button_label: 'Link senden',
                loading_button_label: 'Link wird gesendet...',
                link_text: 'Login mit Magic Link',
              },
              forgotten_password: {
                email_label: 'E-Mail Adresse',
                button_label: 'Passwort zurücksetzen',
                loading_button_label: 'Sende Anweisungen...',
                link_text: 'Passwort vergessen?',
              },
            },
          }}
          theme="default"
          providers={[]}
        />
      </div>
    </div>
  );
};

export default Login;