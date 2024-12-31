import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SubjectList } from "@/components/SubjectList";
import { Subject, Grade } from "@/types";

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
            Notenverwaltung
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

export default Landing;