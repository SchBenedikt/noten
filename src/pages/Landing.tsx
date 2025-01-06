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
              className="w-full sm:w-auto hover:scale-105 transition-transform"
              onClick={() => navigate("/login")}
            >
              Jetzt starten
            </Button>
          </div>

          <div className="animate-fade-in animation-delay-500 grid grid-cols-1 gap-4 px-4 sm:px-6 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
            <FeatureCard
              title="Fächerverwaltung"
              description="Organisiere deine Fächer übersichtlich und effizient. Behalte den Überblick über alle deine Kurse und Fächer an einem Ort."
            />
            <FeatureCard
              title="Notenübersicht"
              description="Verfolge deinen Fortschritt mit einer übersichtlichen Darstellung deiner Noten. Berechne Durchschnitte und erkenne Trends."
            />
            <FeatureCard
              title="Klassenstufenspezifisch"
              description="Passe die Anwendung an deine aktuelle Klassenstufe an. Alle Funktionen sind optimal auf deine Bedürfnisse abgestimmt."
            />
          </div>

          <div className="animate-fade-in animation-delay-500 max-w-[800px] text-center mt-8">
            <h2 className="text-2xl font-semibold mb-4">Dein digitaler Lernbegleiter</h2>
            <p className="text-muted-foreground">
              Subject Sculptor ist mehr als nur eine Notenverwaltung. Es ist dein persönlicher Assistent für akademischen Erfolg. 
              Mit intuitiver Bedienung und intelligenten Funktionen unterstützt dich die App dabei, deine Lernziele zu erreichen 
              und deinen schulischen Werdegang optimal zu gestalten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="hover:scale-105 rounded-lg border bg-card p-4 md:p-6 text-card-foreground shadow-sm transition-all">
      <h3 className="mb-2 text-lg md:text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;