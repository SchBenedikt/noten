import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const [projectUrl, setProjectUrl] = useState(() => {
    return localStorage.getItem("supabase_url") || "";
  });

  const handleSave = () => {
    if (!projectUrl) {
      toast({
        title: "Fehler",
        description: "Bitte gib eine Projekt-URL ein",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorage.setItem("supabase_url", projectUrl);
      toast({
        title: "Erfolg",
        description: "Die Projekt-URL wurde gespeichert",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Projekt-URL konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Einstellungen" />
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Konfiguration</CardTitle>
            <CardDescription>
              Konfiguriere hier deine selbst-gehostete Supabase-Instanz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-url">Projekt-URL</Label>
              <Input
                id="project-url"
                placeholder="https://deine-supabase-instanz.de"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleSave}>Speichern</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;