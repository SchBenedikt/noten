import { EmailForm } from "@/components/profile/EmailForm";
import { PasswordForm } from "@/components/profile/PasswordForm";
import { SchoolForm } from "@/components/profile/SchoolForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Profil bearbeiten</h1>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Zurück
          </button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>E-Mail-Adresse ändern</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passwort ändern</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schule ändern</CardTitle>
            </CardHeader>
            <CardContent>
              <SchoolForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;