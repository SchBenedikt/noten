import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SubjectList } from "@/components/SubjectList";
import { Subject, Grade } from "@/types";
import { ArrowDown, BookOpen, Brain, GraduationCap, LineChart, Users } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [demoSubjects, setDemoSubjects] = useState<Subject[]>([
    {
      id: "demo-1",
      name: "Mathematik",
      type: "main",
      writtenWeight: 2,
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

  const handleDemoAddGrade = async (subjectId: string, grade: Omit<Grade, 'id'>) => {
    setDemoSubjects(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          grades: [...subject.grades, { ...grade, id: `grade-${Date.now()}` }]
        };
      }
      return subject;
    }));
  };

  const handleDemoUpdateGrade = async (subjectId: string, gradeId: string, grade: Omit<Grade, 'id'>) => {
    setDemoSubjects(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          grades: subject.grades.map(g => g.id === gradeId ? { ...grade, id: gradeId } : g)
        };
      }
      return subject;
    }));
  };

  const handleDemoDeleteGrade = async (subjectId: string, gradeId: string) => {
    setDemoSubjects(prev => prev.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          grades: subject.grades.filter(g => g.id !== gradeId)
        };
      }
      return subject;
    }));
  };

  const handleDemoDeleteSubject = async (subjectId: string) => {
    setDemoSubjects(prev => prev.filter(subject => subject.id !== subjectId));
  };

  const handleDemoUpdateSubject = async (subjectId: string, updates: Partial<Subject>) => {
    setDemoSubjects(prev => prev.map(subject => 
      subject.id === subjectId ? { ...subject, ...updates } : subject
    ));
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-primary/5 to-secondary/5 overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12 text-center">
          <h1 className="animate-fade-in text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Subject Sculptor
          </h1>
          
          <p className="animate-fade-in animation-delay-200 max-w-[700px] text-lg md:text-xl text-muted-foreground sm:text-2xl px-4 leading-relaxed">
            Gestalte dein Lernerlebnis. Verwalte deine Fächer und Noten einfach und effizient mit einer modernen und intuitiven Plattform.
          </p>

          <div className="animate-fade-in animation-delay-300 flex flex-col w-full px-4 space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0 sm:px-0 sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto hover:scale-105 transition-transform duration-200"
              onClick={() => navigate("/login")}
            >
              Jetzt starten
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto hover:scale-105 transition-transform duration-200"
              onClick={() => {
                const demoSection = document.getElementById('demo-section');
                demoSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Demo ausprobieren
            </Button>
          </div>

          <div className="w-full max-w-5xl pt-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 animate-fade-in animation-delay-500">
              Warum Subject Sculptor?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
              <FeatureCard
                icon={<BookOpen className="w-8 h-8 mb-4 text-primary" />}
                title="Übersichtlich"
                description="Alle deine Fächer und Noten auf einen Blick. Klar strukturiert und einfach zu verstehen."
                delay="500"
              />
              <FeatureCard
                icon={<LineChart className="w-8 h-8 mb-4 text-primary" />}
                title="Statistiken"
                description="Detaillierte Auswertungen deiner Leistungen. Erkenne Trends und Verbesserungspotenziale."
                delay="600"
              />
              <FeatureCard
                icon={<Brain className="w-8 h-8 mb-4 text-primary" />}
                title="Intelligent"
                description="Automatische Durchschnittsberechnung und clevere Notenverwaltung."
                delay="700"
              />
            </div>
          </div>

          <div className="w-full pt-16 flex flex-col items-center animate-fade-in animation-delay-700">
            <ArrowDown className="w-6 h-6 text-primary animate-bounce" />
            <span className="text-sm text-muted-foreground mt-2">Scrolle nach unten für die Demo</span>
          </div>

          <div className="w-full max-w-5xl pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 items-center">
              <div className="space-y-4 animate-fade-in animation-delay-800">
                <GraduationCap className="w-12 h-12 text-primary" />
                <h3 className="text-2xl font-bold">Für Schüler und Studenten</h3>
                <p className="text-muted-foreground">
                  Egal ob Gymnasium, Universität oder Berufsschule - Subject Sculptor passt sich deinen Bedürfnissen an. 
                  Behalte den Überblick über deine akademische Laufbahn und setze dir Ziele für die Zukunft.
                </p>
              </div>
              <div className="space-y-4 animate-fade-in animation-delay-900">
                <Users className="w-12 h-12 text-primary" />
                <h3 className="text-2xl font-bold">Gemeinsam Lernen</h3>
                <p className="text-muted-foreground">
                  Teile deine Erfolge mit anderen und motiviere dich gegenseitig. 
                  Mit Subject Sculptor behältst du den Überblick über deine Leistungen und kannst dich auf das Wesentliche konzentrieren.
                </p>
              </div>
            </div>
          </div>

          <div id="demo-section" className="w-full max-w-6xl mt-16 animate-fade-in animation-delay-1000">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Demo-Version</h2>
              <p className="text-muted-foreground mb-8">
                Probiere die Notenverwaltung direkt aus! Diese Demo-Version zeigt dir die wichtigsten Funktionen.
                Registriere dich für den vollen Funktionsumfang.
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

const FeatureCard = ({ icon, title, description, delay }: { 
  icon: React.ReactNode;
  title: string; 
  description: string;
  delay: string;
}) => {
  return (
    <div className={`animate-fade-in animation-delay-${delay} hover:scale-105 transition-all duration-300 rounded-lg border bg-card p-6 text-card-foreground shadow-sm`}>
      <div className="flex flex-col items-center text-center">
        {icon}
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Landing;