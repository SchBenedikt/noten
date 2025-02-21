import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/LoginForm";

const Login = () => {
  const navigate = useNavigate();
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-6 transition-transform transform hover:scale-105">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Notenverwaltung
          </h1>
          <p className="text-sm text-muted-foreground">
            {showRegistration ? "Registriere dich, um deine Noten zu verwalten" : "Melde dich an, um deine Noten zu verwalten"}
          </p>
        </div>

        {showRegistration ? <RegistrationForm /> : <LoginForm />}

        <Button
          variant="outline"
          className="w-full transition-transform transform hover:scale-105"
          onClick={() => setShowRegistration(!showRegistration)}
        >
          {showRegistration ? "Zurück zum Login" : "Neu hier? Registriere dich"}
        </Button>
      </div>
    </div>
  );
};

export default Login;
