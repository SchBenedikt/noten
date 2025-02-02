import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header title="Notenverwaltung" showBackButton={false} />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center px-4">
          <p className="text-xl mb-8">
            Verwalten Sie Ihre Noten einfach und effizient. Beginnen Sie mit der Einrichtung Ihrer eigenen Instanz oder nutzen Sie unseren Cloud-Service.
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate("/self-hosting")} variant="outline">
              Eigene Instanz einrichten
            </Button>
            <Button onClick={() => navigate("/login")}>
              Cloud-Version nutzen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;