import { SubjectList } from "@/components/SubjectList";
import { SubjectForm } from "@/components/SubjectForm";
import { useSubjects } from "@/hooks/use-subjects";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserCircle2 } from "lucide-react";

const Index = () => {
  const {
    subjects,
    addSubject,
    addGrade,
    updateGrade,
    deleteGrade,
    deleteSubject,
    updateSubject,
    currentGradeLevel,
  } = useSubjects();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            Notenverwaltung {currentGradeLevel}. Klasse
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2"
          >
            <UserCircle2 className="h-4 w-4" />
            Profil
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-[300px,1fr]">
          <div className="space-y-6">
            <SubjectForm
              onSubmit={addSubject}
              currentGradeLevel={currentGradeLevel}
            />
          </div>

          <SubjectList
            subjects={subjects}
            onAddGrade={addGrade}
            onUpdateGrade={updateGrade}
            onDeleteGrade={deleteGrade}
            onDeleteSubject={deleteSubject}
            onUpdateSubject={updateSubject}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;