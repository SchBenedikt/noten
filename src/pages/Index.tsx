import { SubjectForm } from '@/components/SubjectForm';
import { SubjectList } from '@/components/SubjectList';
import { calculateOverallAverage } from '@/lib/calculations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubjects } from '@/hooks/use-subjects';
import { MainNav } from '@/components/MainNav';

const Index = () => {
  const {
    subjects,
    isLoading,
    error,
    addSubject,
    deleteSubject,
    updateSubject,
    currentGradeLevel,
  } = useSubjects();
  const isMobile = useIsMobile();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const overallAverage = calculateOverallAverage(subjects);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <MainNav />

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          Notendurchschnitt: {overallAverage !== null ? overallAverage.toFixed(2) : "N/A"}
        </h2>
        <p className="text-muted-foreground">
          Klassenstufe {currentGradeLevel}
        </p>
      </div>

      <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-[300px,1fr] gap-8'}`}>
        <div>
          <SubjectForm onSubmit={addSubject} />
        </div>

        <div className="space-y-4">
          <SubjectList
            subjects={subjects}
            isLoading={isLoading}
            onDeleteSubject={deleteSubject}
            onUpdateSubject={updateSubject}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;