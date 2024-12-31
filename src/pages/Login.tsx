import { useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { toast } from "sonner";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleAuthError = (error: Error) => {
    console.error("Auth error:", error);
    
    if (error.message.includes("Invalid login credentials")) {
      toast.error("Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.");
    } else {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Notenverwaltung
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Melden Sie sich an oder erstellen Sie ein Konto
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#000000',
                    brandAccent: '#666666',
                  },
                },
              },
            }}
            theme="light"
            providers={[]}
            onError={handleAuthError}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-Mail',
                  password_label: 'Passwort',
                  button_label: 'Anmelden',
                },
                sign_up: {
                  email_label: 'E-Mail',
                  password_label: 'Passwort',
                  button_label: 'Registrieren',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;