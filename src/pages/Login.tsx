import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();

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
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Notenverwaltung
          </h1>
          <p className="text-sm text-muted-foreground">
            Melde dich an, um deine Noten zu verwalten
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "hsl(var(--primary))",
                  brandAccent: "hsl(var(--primary) / 0.9)",
                },
              },
            },
            className: {
              container: "space-y-4",
              button:
                "w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors",
              input:
                "w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              label: "block text-sm font-medium text-foreground mb-1",
              anchor: "text-sm text-primary hover:text-primary/90",
              divider: "text-muted-foreground",
              message: "text-sm text-muted-foreground",
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: "E-Mail Adresse",
                password_label: "Passwort",
                button_label: "Anmelden",
                loading_button_label: "Wird angemeldet...",
                social_provider_text: "Anmelden mit {{provider}}",
                link_text: "Bereits registriert? Anmelden",
              },
              magic_link: {
                email_input_label: "E-Mail Adresse",
                button_label: "Link senden",
                loading_button_label: "Link wird gesendet...",
                link_text: "Login mit Magic Link",
              },
              forgotten_password: {
                email_label: "E-Mail Adresse",
                button_label: "Passwort zurücksetzen",
                loading_button_label: "Sende Anweisungen...",
                link_text: "Passwort vergessen?",
              },
            },
          }}
          theme="default"
          providers={[]}
          view="sign_in"
        />
      </div>
    </div>
  );
};

export default Login;
