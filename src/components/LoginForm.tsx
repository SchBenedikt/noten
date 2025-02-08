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
import { LogIn } from "lucide-react";

export const LoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleLogin = async () => {
    setEmailError(false);
    setPasswordError(false);

    if (!email) {
      setEmailError(true);
      toast({
        title: "Fehler",
        description: "Bitte gib eine E-Mail-Adresse ein",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      setPasswordError(true);
      toast({
        title: "Fehler",
        description: "Bitte gib ein Passwort ein",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setEmailError(true);
        setPasswordError(true);
        throw new Error("Ungültige Anmeldedaten");
      }

      toast({
        title: "Erfolg",
        description: "Anmeldung erfolgreich!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto transition-transform transform hover:scale-105">
      <CardHeader>
        <CardTitle className="flex items-center">
          <LogIn className="mr-2 h-5 w-5" />
          Anmelden
        </CardTitle>
        <CardDescription>
          Melde dich mit deiner E-Mail und deinem Passwort an
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`transition-colors focus:border-primary focus:ring-primary ${emailError ? 'border-red-500' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`transition-colors focus:border-primary focus:ring-primary ${passwordError ? 'border-red-500' : ''}`}
            />
          </div>
          <Button
            className="w-full transition-transform transform hover:scale-105"
            onClick={handleLogin}
            disabled={isLoading}
          >
            Anmelden
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
