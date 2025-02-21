import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegistrationData {
  email: string;
  password: string;
  firstName: string | null;
  schoolId: string | null;
  gradeLevel: number;
}

const getErrorMessage = (error: any) => {
  if (error?.body) {
    try {
      const body = JSON.parse(error.body);
      if (body.code === "over_email_send_rate_limit") {
        const seconds = body.message.match(/\d+/)?.[0] || "60";
        return `Bitte warte ${seconds} Sekunden, bevor du es erneut versuchst.`;
      }
    } catch (e) {
      // If JSON parsing fails, fall back to default message
    }
  }
  return error.message || "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.";
};

export const RegistrationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    firstName: null,
    schoolId: null,
    gradeLevel: 5,
  });

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);

  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");

  const fetchSchools = async () => {
    const { data } = await supabase
      .from("schools")
      .select("id, name")
      .order("name");
    if (data) setSchools(data);
  };

  const handleCreateSchool = async () => {
    if (!newSchoolName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Schulnamen ein",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: school, error } = await supabase
      .from("schools")
      .insert({ name: newSchoolName.trim(), created_by: user.id })
      .select()
      .single();

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen der Schule",
        variant: "destructive",
      });
      return;
    }

    setFormData({ ...formData, schoolId: school.id });
    await fetchSchools();
    setIsCreatingSchool(false);
    setNewSchoolName("");
    toast({
      title: "Erfolg",
      description: "Schule wurde erstellt",
    });
  };

  const handleNext = async () => {
    setEmailError(false);
    setPasswordError(false);
    setFirstNameError(false);

    if (step === 1) {
      if (!formData.email) {
        setEmailError(true);
        toast({
          title: "Fehler",
          description: "Bitte gib eine E-Mail-Adresse ein",
          variant: "destructive",
        });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setEmailError(true);
        toast({
          title: "Fehler",
          description: "Bitte gib eine gültige E-Mail-Adresse ein",
          variant: "destructive",
        });
        return;
      }
      if (!formData.password) {
        setPasswordError(true);
        toast({
          title: "Fehler",
          description: "Bitte gib ein Passwort ein",
          variant: "destructive",
        });
        return;
      }
      if (formData.password.length < 6) {
        setPasswordError(true);
        toast({
          title: "Fehler",
          description: "Das Passwort muss mindestens 6 Zeichen lang sein",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.firstName) {
        setFirstNameError(true);
        toast({
          title: "Fehler",
          description: "Bitte gib deinen Vornamen ein",
          variant: "destructive",
        });
        return;
      }
      await fetchSchools();
      setStep(3);
    } else if (step === 3) {
      await handleRegistration();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleRegistration = async () => {
    setIsLoading(true);
    try {
      // First sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      // Make sure we have a user ID before proceeding
      if (!authData.user?.id) {
        throw new Error("User ID not available after signup");
      }

      // Now update the profile with the user ID
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          school_id: formData.schoolId,
          grade_level: formData.gradeLevel,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      // Automatically sign in after registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      toast({
        title: "Erfolg",
        description: "Registrierung erfolgreich!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto transition-transform transform hover:scale-105">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="mr-2 h-5 w-5" />
          Registrierung
        </CardTitle>
        <CardDescription>
          {step === 1 && "Gib deine E-Mail und ein Passwort ein"}
          {step === 2 && "Wie heißt du?"}
          {step === 3 && "Fast geschafft! Noch ein paar Details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="E-Mail"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`transition-colors focus:border-primary focus:ring-primary ${emailError ? 'border-red-500' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Passwort"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`transition-colors focus:border-primary focus:ring-primary ${passwordError ? 'border-red-500' : ''}`}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Vorname"
                value={formData.firstName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className={`transition-colors focus:border-primary focus:ring-primary ${firstNameError ? 'border-red-500' : ''}`}
              />
            </div>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Schule</label>
                {isCreatingSchool ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Name der Schule"
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCreateSchool}>Erstellen</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreatingSchool(false);
                          setNewSchoolName("");
                        }}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Select
                      value={formData.schoolId || "none"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          schoolId: value === "none" ? null : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wähle eine Schule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Keine Schule</SelectItem>
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
                      onClick={() => setIsCreatingSchool(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Neue Schule erstellen
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Klassenstufe</label>
                <Select
                  value={formData.gradeLevel.toString()}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      gradeLevel: parseInt(value),
                    })
                  }
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
            </>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Zurück
              </Button>
            )}
            <Button
              className={step === 1 ? "w-full transition-transform transform hover:scale-105" : ""}
              onClick={handleNext}
              disabled={isLoading}
            >
              {step === 3 ? "Registrieren" : "Weiter"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
