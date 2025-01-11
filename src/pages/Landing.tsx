import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SubjectList } from "@/components/SubjectList";
import { BookOpen, BarChart2, LineChart, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12 text-center">
          <div className="space-y-4">
            <h1 className="animate-fade-in text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-primary">
              Notenverwaltung
            </h1>
            
            <p className="animate-fade-in animation-delay-200 max-w-[600px] text-base md:text-lg text-muted-foreground sm:text-xl">
              Gestalte dein Lernerlebnis. Verwalte deine Fächer und Noten einfach und effizient.
            </p>
          </div>

          <div className="animate-fade-in animation-delay-300 flex flex-col w-full px-4 space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0 sm:px-0 sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto hover:scale-105 transition-transform duration-200 bg-primary text-primary-foreground"
              onClick={() => navigate("/login")}
            >
              Jetzt starten <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="animate-fade-in animation-delay-500 grid grid-cols-1 gap-4 px-4 sm:px-6 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
            <FeatureCard
              title="Fächerverwaltung"
              description="Organisiere deine Fächer übersichtlich und effizient."
              icon={<BookOpen className="h-8 w-8" />}
            />
            <FeatureCard
              title="Notenübersicht"
              description="Behalte den Überblick über deine Leistungen."
              icon={<BarChart2 className="h-8 w-8" />}
            />
            <FeatureCard
              title="Statistiken"
              description="Analysiere deinen Lernfortschritt mit detaillierten Auswertungen."
              icon={<LineChart className="h-8 w-8" />}
            />
          </div>

          <div className="animate-fade-in animation-delay-700 mt-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Übersicht über die Anwendung</h2>
            <p className="max-w-[800px] text-base md:text-lg text-muted-foreground sm:text-xl">
              Unsere Anwendung bietet eine umfassende Lösung zur Verwaltung deiner schulischen Leistungen. 
              Du kannst deine Fächer organisieren, deine Noten im Blick behalten und detaillierte Statistiken 
              über deinen Lernfortschritt einsehen. Mit unserer benutzerfreundlichen Oberfläche wird das 
              Verwalten deiner schulischen Aufgaben zum Kinderspiel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ 
  title, 
  description, 
  icon 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}) => {
  return (
    <div className="group hover:scale-105 transition-all duration-300 rounded-lg border bg-card p-6 text-card-foreground shadow-sm flex flex-col items-center">
      <div className="mb-4 text-primary flex justify-center">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </div>
  );
};

export default Landing;
