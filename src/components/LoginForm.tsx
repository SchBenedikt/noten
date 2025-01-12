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

export const LoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

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

  return (
    <Card className="w-full max-w-md mx-auto transition-transform transform hover:scale-105">
      <CardHeader>
        <CardTitle>Anmelden</CardTitle>
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
              className="transition-colors focus:border-primary focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="transition-colors focus:border-primary focus:ring-primary"
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
