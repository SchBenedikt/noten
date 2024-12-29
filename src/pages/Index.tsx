import { SubjectForm } from '@/components/SubjectForm';
import { SubjectList } from '@/components/SubjectList';
import { calculateOverallAverage } from '@/lib/calculations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubjects } from '@/hooks/use-subjects';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Subject, School } from '@/types';
import { useEffect, useState } from 'react';
import { SchoolSelector } from '@/components/SchoolSelector';

const Index = () => {
  const {
    subjects,
    addSubject,
    addGrade,
    updateGrade,
    deleteGrade,
    deleteSubject,
    updateSubject,
  } = useSubjects();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: "Fehler",
          description: "Schulen konnten nicht geladen werden",
          variant: "destructive",
        });
        return;
      }

      setSchools(data || []);
      setLoading(false);
    };

    fetchSchools();
  }, []);

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

  const handleUpdateSubject = async (subjectId: string, updates: Partial<Subject>) => {
    await updateSubject(subjectId, updates);
  };

  const overallAverage = calculateOverallAverage(subjects);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!selectedSchool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center">Wähle deine Schule</h1>
          <p className="text-center text-muted-foreground">
            Bevor du beginnen kannst, wähle bitte deine Schule aus.
          </p>
          <SchoolSelector
            schools={schools}
            selectedSchool={selectedSchool}
            onSchoolSelect={setSelectedSchool}
          />
        </div>
      </div>
    );
  }

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
              onUpdateSubject={handleUpdateSubject}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;