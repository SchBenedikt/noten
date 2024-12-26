import { SubjectForm } from '@/components/SubjectForm';
import { SubjectList } from '@/components/SubjectList';
import { calculateOverallAverage } from '@/lib/calculations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubjects } from '@/hooks/use-subjects';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Notenverwaltung
            </h1>
            {subjects.length > 0 && (
              <p className="text-lg text-gray-600">
                Gesamtdurchschnitt:{' '}
                <span className="font-semibold text-purple-600">{overallAverage}</span>
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center gap-2 hover:bg-purple-100"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
        </div>

        <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-[300px,1fr] gap-8'}`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Neues Fach</h2>
            <SubjectForm onSubmit={addSubject} />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Meine Fächer</h2>
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