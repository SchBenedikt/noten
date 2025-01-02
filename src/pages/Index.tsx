import { SubjectForm } from '@/components/SubjectForm';
import { SubjectList } from '@/components/SubjectList';
import { calculateOverallAverage } from '@/lib/calculations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubjects } from '@/hooks/use-subjects';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Subject } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusIcon, MinusIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

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
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [startCount, setStartCount] = useState(false);

  useEffect(() => {
    setStartCount(true);
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
  const totalGrades = subjects.reduce((sum, subject) => sum + subject.grades.length, 0);
  const mainSubjectsCount = subjects.filter(s => s.type === 'main').length;
  const secondarySubjectsCount = subjects.filter(s => s.type === 'secondary').length;

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
          <div className="space-y-4">
            <Collapsible open={isAddingSubject} onOpenChange={setIsAddingSubject}>
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Fächer</h2>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {isAddingSubject ? <MinusIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                {!isAddingSubject ? (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 p-2"
                  >
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>Hauptfächer: <CountUp start={0} end={mainSubjectsCount} duration={2} startOnMount={startCount} /></p>
                      <p>Nebenfächer: <CountUp start={0} end={secondarySubjectsCount} duration={2} startOnMount={startCount} /></p>
                      <p>Gesamt Noten: <CountUp start={0} end={totalGrades} duration={2} startOnMount={startCount} /></p>
                    </div>
                    <Button 
                      onClick={() => setIsAddingSubject(true)}
                      className="w-full"
                    >
                      Neues Fach hinzufügen
                    </Button>
                  </motion.div>
                ) : (
                  <CollapsibleContent>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <SubjectForm onSubmit={addSubject} />
                    </motion.div>
                  </CollapsibleContent>
                )}
              </div>
            </Collapsible>
          </div>

          <div className="space-y-6">
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
