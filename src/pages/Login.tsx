import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [showNewSchoolInput, setShowNewSchoolInput] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: schools } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSchoolChange = (value: string) => {
    if (value === "new") {
      setShowNewSchoolInput(true);
      setSelectedSchool("");
    } else {
      setShowNewSchoolInput(false);
      setSelectedSchool(value);
    }
  };

  const createNewSchool = async () => {
    const { data, error } = await supabase
      .from("schools")
      .insert([{ name: newSchoolName }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Fehler",
        description: "Schule konnte nicht erstellt werden",
        variant: "destructive",
      });
      throw error;
    }

    return data.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let schoolId = selectedSchool;

      if (isSignUp) {
        if (showNewSchoolInput) {
          if (!newSchoolName) {
            toast({
              title: "Fehler",
              description: "Bitte geben Sie einen Schulnamen ein",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          schoolId = await createNewSchool();
        } else if (!selectedSchool) {
          toast({
            title: "Fehler",
            description: "Bitte wählen Sie eine Schule aus",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // Update profile with school_id
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ school_id: schoolId })
          .eq("id", (await supabase.auth.getUser()).data.user?.id);

        if (updateError) throw updateError;

        toast({
          title: "Erfolg",
          description: "Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails.",
        });
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? "Registrieren" : "Anmelden"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {isSignUp && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="school">Schule</Label>
                  <Select onValueChange={handleSchoolChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wähle deine Schule" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools?.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">Neue Schule erstellen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {showNewSchoolInput && (
                  <div>
                    <Label htmlFor="newSchool">Name der neuen Schule</Label>
                    <Input
                      id="newSchool"
                      type="text"
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Laden..." : isSignUp ? "Registrieren" : "Anmelden"}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isSignUp
              ? "Bereits registriert? Hier anmelden"
              : "Noch kein Konto? Hier registrieren"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;