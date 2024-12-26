import { SubjectForm } from '@/components/SubjectForm';
import { SubjectList } from '@/components/SubjectList';
import { calculateOverallAverage } from '@/lib/calculations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubjects } from '@/hooks/use-subjects';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const {
    subjects,
    addSubject,
    addGrade,
    updateGrade,
    deleteGrade,
    deleteSubject,
  } = useSubjects();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Abmelden",
        variant: "destructive",
      });
      return;
    }
    navigate('/login');
  };

  const overallAverage = calculateOverallAverage(subjects);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Notenverwaltung</h1>
            {subjects.length > 0 && (
              <p className="text-lg sm:text-xl text-gray-600">
                Gesamtdurchschnitt: <span className="font-semibold">{overallAverage}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Abmelden
          </button>
        </div>

        <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-[300px,1fr] gap-8'}`}>
          <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Neues Fach</h2>
            <SubjectForm onSubmit={addSubject} />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Meine Fächer</h2>
            <SubjectList
              subjects={subjects}
              onAddGrade={addGrade}
              onUpdateGrade={updateGrade}
              onDeleteGrade={deleteGrade}
              onDeleteSubject={deleteSubject}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;