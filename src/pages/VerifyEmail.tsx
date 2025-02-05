import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        toast.error("Ungültiger Verifizierungslink");
        navigate("/login");
        return;
      }

      try {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("verification_token", token)
          .limit(1);

        if (profileError || !profiles?.length) {
          throw new Error("Ungültiger Verifizierungstoken");
        }

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ verification_token: null })
          .eq("id", profiles[0].id);

        if (updateError) throw updateError;

        toast.success("E-Mail-Adresse erfolgreich verifiziert!");
        setTimeout(() => navigate("/login"), 2000);
      } catch (error: any) {
        toast.error(error.message || "Fehler bei der Verifizierung");
        navigate("/login");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-2xl">
            <Mail className="mr-2 h-6 w-6" />
            E-Mail Verifizierung
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {isVerifying ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p>Verifiziere deine E-Mail-Adresse...</p>
            </div>
          ) : (
            <Button onClick={() => navigate("/login")}>
              Zum Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;