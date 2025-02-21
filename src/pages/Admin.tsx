
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { achievementInfo } from "@/components/AchievementsList";
import { fetchAndCreateMissingAchievements } from "@/lib/achievements";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('check_admin_password', {
        input_password: password
      });

      if (error) throw error;

      if (data) {
        setIsAuthenticated(true);
        toast({
          title: "Erfolgreich angemeldet",
          description: "Sie haben jetzt Zugriff auf die Admin-Funktionen.",
        });
      } else {
        toast({
          title: "Falsches Passwort",
          description: "Bitte versuchen Sie es erneut.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanAchievements = async () => {
    setIsLoading(true);
    try {
      await fetchAndCreateMissingAchievements();
      toast({
        title: "Erfolgreich",
        description: "Alle Auszeichnungen wurden gescannt und aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Scannen der Auszeichnungen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-4 max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Admin-Bereich</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Anmeldung</CardTitle>
              <CardDescription>
                Bitte geben Sie das Admin-Passwort ein.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Admin-Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Lädt..." : "Anmelden"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Admin-Bereich</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Auszeichnungen scannen</CardTitle>
              <CardDescription>
                Scannt alle Noten und weist neue Auszeichnungen zu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleScanAchievements} 
                disabled={isLoading}
              >
                {isLoading ? "Lädt..." : "Jetzt scannen"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verfügbare Auszeichnungen</CardTitle>
              <CardDescription>
                Übersicht aller möglichen Auszeichnungen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(achievementInfo).map(([type, info]) => (
                  <div key={type} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{info.title}</h3>
                      <p className="text-sm text-gray-500">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
