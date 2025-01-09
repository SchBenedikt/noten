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

  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);

  const fetchSchools = async () => {
    const { data } = await supabase
      .from("schools")
      .select("id, name")
      .order("name");
    if (data) setSchools(data);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.email || !formData.password) {
        toast({
          title: "Fehler",
          description: "Bitte fülle alle Felder aus",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.firstName) {
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

      toast({
        title: "Erfolg",
        description:
          "Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse.",
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Registrierung</CardTitle>
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
              />
            </div>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Schule (optional)</label>
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
              className={step === 1 ? "w-full" : ""}
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