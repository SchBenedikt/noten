import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Landing = () => {
  const navigate = useNavigate();
  const currentUrl = window.location.origin;
  const [instanceUrl, setInstanceUrl] = useState(currentUrl);
  const [isOpen, setIsOpen] = useState(false);

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
          <p className="text-xl mb-8 animate-fade-in">
            Verwalten Sie Ihre Noten einfach und effizient. Beginnen Sie mit der Einrichtung Ihrer eigenen Instanz oder nutzen Sie unseren Cloud-Service.
          </p>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2 animate-fade-in animation-delay-200">
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full max-w-sm hover:scale-105 transition-transform duration-200"
              >
                Diese Version nutzen
              </Button>
              <span className="text-sm text-muted-foreground">
                Aktuelle Instanz: {currentUrl}
              </span>
            </div>
            
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="w-full max-w-sm mx-auto space-y-2 animate-fade-in animation-delay-300"
            >
              <div className="flex items-center justify-center">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-accent"
                  >
                    <span>Andere Instanz nutzen</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-4">
                <div className="pt-4 border-t border-border">
                  <div className="space-y-2">
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
                  <Button 
                    onClick={handleInstanceChange} 
                    variant="outline" 
                    className="w-full mt-4 hover:scale-105 transition-transform duration-200"
                  >
                    Zu anderer Instanz wechseln
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Button 
              onClick={() => navigate("/self-hosting")} 
              variant="outline" 
              className="w-full max-w-sm mx-auto hover:scale-105 transition-transform duration-200 animate-fade-in animation-delay-500"
            >
              Eigene Instanz einrichten
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;