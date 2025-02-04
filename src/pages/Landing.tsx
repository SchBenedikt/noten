import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";

const Landing = () => {
  const navigate = useNavigate();
  const currentUrl = window.location.origin;
  const [instanceUrl, setInstanceUrl] = useState(currentUrl);

  const handleInstanceChange = () => {
    if (instanceUrl && instanceUrl !== currentUrl) {
      window.location.href = instanceUrl;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header title="Notenverwaltung" showBackButton={false} />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center px-4">
          <p className="text-xl mb-8">
            Verwalten Sie Ihre Noten einfach und effizient. Beginnen Sie mit der Einrichtung Ihrer eigenen Instanz oder nutzen Sie unseren Cloud-Service.
          </p>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <Button onClick={() => navigate("/login")} className="w-full max-w-sm">
                Diese Version nutzen
              </Button>
              <span className="text-sm text-muted-foreground">
                Aktuelle Instanz: {currentUrl}
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-4 pt-4 border-t border-border max-w-sm mx-auto">
              <div className="w-full space-y-2">
                <Label htmlFor="instanceUrl">Andere Instanz nutzen</Label>
                <Input
                  id="instanceUrl"
                  type="url"
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  placeholder="https://andere-instanz.de"
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleInstanceChange} 
                variant="outline" 
                className="w-full"
              >
                Zu anderer Instanz wechseln
              </Button>
            </div>

            <Button onClick={() => navigate("/self-hosting")} variant="outline" className="w-full max-w-sm mx-auto">
              Eigene Instanz einrichten
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;