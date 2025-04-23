
import { useState, useEffect } from "react";
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
  CardFooter,
} from "@/components/ui/card";
import { LogIn, AlertCircle } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email({ message: "Bitte gib eine gültige E-Mail-Adresse ein" }),
  password: z.string().min(6, { message: "Das Passwort muss mindestens 6 Zeichen lang sein" }),
});

export const LoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  
  // Clear related error when input changes
  useEffect(() => {
    setEmailError("");
    setFormError("");
  }, [email]);
  
  useEffect(() => {
    setPasswordError("");
    setFormError("");
  }, [password]);

  const validateForm = () => {
    const result = loginSchema.safeParse({ email, password });
    
    if (!result.success) {
      const formattedErrors = result.error.format();
      
      if (formattedErrors.email?._errors) {
        setEmailError(formattedErrors.email._errors[0]);
      }
      
      if (formattedErrors.password?._errors) {
        setPasswordError(formattedErrors.password._errors[0]);
      }
      
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    setFormError("");
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setFormError(
          error.message === "Invalid login credentials"
            ? "Ungültige Anmeldedaten. Bitte überprüfe deine E-Mail und dein Passwort."
            : error.message || "Ein Fehler ist aufgetreten. Bitte versuche es später erneut."
        );
        return;
      }

      toast({
        title: "Erfolgreich",
        description: "Du bist jetzt angemeldet!",
      });
      navigate("/");
    } catch (error: any) {
      setFormError(error.message || "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLogin();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg transition-transform duration-200 ease-in-out hover:shadow-xl">
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} onKeyDown={handleKeyDown}>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center text-2xl font-bold">
            <LogIn className="mr-2 h-6 w-6" />
            Anmelden
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Melde dich mit deiner E-Mail und deinem Passwort an
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-Mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`transition-colors focus:border-primary focus:ring-primary ${
                emailError ? 'border-red-500' : ''
              }`}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              disabled={isLoading}
              autoComplete="email"
            />
            {emailError && (
              <p id="email-error" className="text-sm text-red-500">
                {emailError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-medium">
                Passwort
              </label>
              <a href="/password-reset" className="text-xs text-blue-500 hover:underline">
                Passwort vergessen?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`transition-colors focus:border-primary focus:ring-primary ${
                passwordError ? 'border-red-500' : ''
              }`}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {passwordError && (
              <p id="password-error" className="text-sm text-red-500">
                {passwordError}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full transition-all duration-200 ease-in-out"
            disabled={isLoading}
          >
            {isLoading ? "Anmelden..." : "Anmelden"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
