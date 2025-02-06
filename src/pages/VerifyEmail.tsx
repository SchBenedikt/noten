import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setVerificationStatus('error');
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        // Verify that the token matches
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('verification_token')
          .eq('id', user.id)
          .single();

        if (profileError || profile.verification_token !== token) {
          throw new Error('Invalid verification token');
        }

        // Clear the verification token
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ verification_token: null })
          .eq('id', user.id);

        if (updateError) throw updateError;

        setVerificationStatus('success');
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full space-y-6 text-center">
        {verificationStatus === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <h2 className="text-xl font-semibold">E-Mail wird verifiziert...</h2>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold">E-Mail erfolgreich verifiziert!</h2>
            <p className="text-gray-600">Deine E-Mail-Adresse wurde erfolgreich bestätigt.</p>
            <Button onClick={() => navigate('/profile')}>
              Zurück zum Profil
            </Button>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold">Verifizierung fehlgeschlagen</h2>
            <p className="text-gray-600">Der Verifizierungslink ist ungültig oder abgelaufen.</p>
            <Button onClick={() => navigate('/profile')}>
              Zurück zum Profil
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;