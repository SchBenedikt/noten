import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SubjectList } from "@/components/SubjectList";
import { Subject, Grade } from "@/types";
import { BookOpen, BarChart2, LineChart, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [demoSubjects, setDemoSubjects] = useState<Subject[]>([
    {
      id: "demo-1",
      name: "Mathematik",
      type: "main",
      writtenWeight: 2,
      grade_level: 5,
      grades: [
        {
          id: "grade-1",
          value: 2,
          weight: 1,
          type: "written",
          date: "2024-03-15",
          notes: "Schulaufgabe - Algebra"
        },
        {
          id: "grade-2",
          value: 1,
          weight: 1,
          type: "oral",
          date: "2024-03-10",
          notes: "Mitarbeit"
        }
      ]
    },
    {
      id: "demo-2",
      name: "Deutsch",
      type: "main",
      writtenWeight: 2,
      grade_level: 5,
      grades: [
        {
          id: "grade-3",
          value: 3,
          weight: 1,
          type: "written",
          date: "2024-03-12",
          notes: "Aufsatz"
        }
      ]
    }
  ]);

  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleDemoAddGrade = async (subjectId: string, grade: Omit<Grade, 'id'>) => {
    setShowLoginDialog(true);
  };

  const handleDemoUpdateGrade = async (subjectId: string, gradeId: string, grade: Omit<Grade, 'id'>) => {
    setShowLoginDialog(true);
  };

  const handleDemoDeleteGrade = async (subjectId: string, gradeId: string) => {
    setShowLoginDialog(true);
  };

  const handleDemoDeleteSubject = async (subjectId: string) => {
    setShowLoginDialog(true);
  };

  const handleDemoUpdateSubject = async (subjectId: string, updates: Partial<Subject>) => {
    setShowLoginDialog(true);
  };

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
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto hover:scale-105 transition-transform duration-200 border-2"
              onClick={() => {
                const demoSection = document.getElementById('demo-section');
                demoSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Demo ausprobieren
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

          <div id="demo-section" className="w-full max-w-6xl mt-16 animate-fade-in scroll-mt-16">
            <div className="bg-card rounded-lg shadow-lg p-6 border">
              <h2 className="text-2xl font-bold mb-6 text-primary">
                Demo-Version
              </h2>
              <p className="text-muted-foreground mb-8">
                Probiere die Notenverwaltung direkt aus! Diese Demo-Version zeigt dir die wichtigsten Funktionen.
              </p>
              <SubjectList
                subjects={demoSubjects}
                onAddGrade={handleDemoAddGrade}
                onUpdateGrade={handleDemoUpdateGrade}
                onDeleteGrade={handleDemoDeleteGrade}
                onDeleteSubject={handleDemoDeleteSubject}
                onUpdateSubject={handleDemoUpdateSubject}
                isDemo={true}
              />
            </div>
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
    <div className="group hover:scale-105 transition-all duration-300 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;