import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Landing = () => {
  const navigate = useNavigate();
  const currentUrl = window.location.origin;
  const [instanceUrl, setInstanceUrl] = useState(currentUrl);
  const [open, setOpen] = useState(false);

  const handleInstanceChange = () => {
    if (instanceUrl && instanceUrl !== currentUrl) {
      window.location.href = instanceUrl;
    }
    setOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header title="Notenverwaltung" showBackButton={false} />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center px-4">
          <p className="text-xl mb-8 animate-fade-in">
            Verwalten Sie Ihre Noten einfach und effizient. Beginnen Sie mit der Einrichtung Ihrer eigenen Instanz oder nutzen Sie unseren Cloud-Service.
          </p>
          <div className="space-y-8">
            <div className="flex flex-col items-center gap-4 animate-fade-in animation-delay-200">
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full max-w-sm hover:scale-105 transition-transform duration-200 bg-primary"
              >
                Diese Version nutzen
              </Button>
              <span className="text-sm text-muted-foreground">
                Aktuelle Instanz: {currentUrl}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animation-delay-300">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="hover:bg-accent/50 transition-colors duration-200"
                  >
                    Andere Instanz nutzen
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Instanz wechseln</DialogTitle>
                    <DialogDescription>
                      Geben Sie die URL der gewünschten Instanz ein.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-4">
                    <Label htmlFor="instanceUrl">Instanz URL</Label>
                    <Input
                      id="instanceUrl"
                      type="url"
                      value={instanceUrl}
                      onChange={(e) => setInstanceUrl(e.target.value)}
                      placeholder="https://andere-instanz.de"
                      className="w-full transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleInstanceChange}
                      className="w-full sm:w-auto hover:scale-105 transition-transform duration-200"
                    >
                      Zu anderer Instanz wechseln
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button 
                onClick={() => navigate("/self-hosting")} 
                variant="outline"
                className="hover:bg-accent/50 transition-colors duration-200"
              >
                Eigene Instanz einrichten
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;