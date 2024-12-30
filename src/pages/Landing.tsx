import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-primary/5 to-secondary/5 overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12 text-center">
          <h1 className="animate-fade-in text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Subject Sculptor
          </h1>
          
          <p className="animate-fade-in animation-delay-200 max-w-[600px] text-base md:text-lg text-muted-foreground sm:text-xl px-4">
            Gestalte dein Lernerlebnis. Verwalte deine Fächer und Noten einfach und effizient.
          </p>

          <div className="animate-fade-in animation-delay-300 flex flex-col w-full px-4 space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0 sm:px-0 sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto hover-scale"
              onClick={() => navigate("/login")}
            >
              Jetzt starten
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto hover-scale"
              onClick={() => navigate("/login")}
            >
              Mehr erfahren
            </Button>
          </div>

          <div className="animate-fade-in animation-delay-500 grid grid-cols-1 gap-4 px-4 sm:px-6 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
            <FeatureCard
              title="Fächerverwaltung"
              description="Organisiere deine Fächer übersichtlich und effizient."
            />
            <FeatureCard
              title="Notenübersicht"
              description="Behalte den Überblick über deine Leistungen."
            />
            <FeatureCard
              title="Statistiken"
              description="Analysiere deinen Lernfortschritt mit detaillierten Auswertungen."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="hover-scale rounded-lg border bg-card p-4 md:p-6 text-card-foreground shadow-sm transition-all">
      <h3 className="mb-2 text-lg md:text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;