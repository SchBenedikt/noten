import { useState, useEffect } from 'react';
import { SubjectForm } from '@/components/SubjectForm';
import { SubjectCard } from '@/components/SubjectCard';
import { Subject, Grade } from '@/types';
import { calculateOverallAverage } from '@/lib/calculations';
import { toast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        type,
        written_weight,
        grades (*)
      `)
      .order('created_at', { ascending: true });

    if (subjectsError) {
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Fächer",
        variant: "destructive",
      });
      return;
    }

    setSubjects(subjectsData || []);
  };

  const handleAddSubject = async (newSubject: Omit<Subject, 'id' | 'grades'>) => {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{
        name: newSubject.name,
        type: newSubject.type,
        written_weight: newSubject.writtenWeight,
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen des Fachs",
        variant: "destructive",
      });
      return;
    }

    setSubjects([...subjects, { ...data, grades: [] }]);
    toast({
      title: "Erfolg",
      description: "Fach wurde erfolgreich erstellt",
    });
  };

  const handleAddGrade = async (subjectId: string, grade: Omit<Grade, 'id'>) => {
    const { data, error } = await supabase
      .from('grades')
      .insert([{
        subject_id: subjectId,
        value: grade.value,
        weight: grade.weight,
        type: grade.type,
        date: grade.date,
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen der Note",
        variant: "destructive",
      });
      return;
    }

    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          grades: [...subject.grades, data],
        };
      }
      return subject;
    }));

    toast({
      title: "Erfolg",
      description: "Note wurde erfolgreich hinzugefügt",
    });
  };

  const handleDeleteSubject = async (subjectId: string) => {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen des Fachs",
        variant: "destructive",
      });
      return;
    }

    setSubjects(subjects.filter(subject => subject.id !== subjectId));
    toast({
      title: "Erfolg",
      description: "Fach wurde erfolgreich gelöscht",
    });
  };

  const handleUpdateGrade = async (subjectId: string, gradeId: string, updatedGrade: Omit<Grade, 'id'>) => {
    const { error } = await supabase
      .from('grades')
      .update({
        value: updatedGrade.value,
        weight: updatedGrade.weight,
        type: updatedGrade.type,
        date: updatedGrade.date,
      })
      .eq('id', gradeId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren der Note",
        variant: "destructive",
      });
      return;
    }

    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          grades: subject.grades.map(grade => 
            grade.id === gradeId ? { ...updatedGrade, id: gradeId } : grade
          ),
        };
      }
      return subject;
    }));

    toast({
      title: "Erfolg",
      description: "Note wurde erfolgreich aktualisiert",
    });
  };

  const handleDeleteGrade = async (subjectId: string, gradeId: string) => {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', gradeId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen der Note",
        variant: "destructive",
      });
      return;
    }

    setSubjects(subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          grades: subject.grades.filter(grade => grade.id !== gradeId),
        };
      }
      return subject;
    }));

    toast({
      title: "Erfolg",
      description: "Note wurde erfolgreich gelöscht",
    });
  };

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
            <SubjectForm onSubmit={handleAddSubject} />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Meine Fächer</h2>
            {subjects.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <p className="text-center text-gray-500">
                  Noch keine Fächer vorhanden. Fügen Sie Ihr erstes Fach hinzu!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onAddGrade={handleAddGrade}
                    onUpdateGrade={handleUpdateGrade}
                    onDeleteGrade={handleDeleteGrade}
                    onDeleteSubject={handleDeleteSubject}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;