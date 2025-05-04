import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { GradeLevelSelector } from '@/components/GradeLevelSelector';
import { useGradeLevel } from '@/hooks/use-grade-level';

const Profile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updateGradeLevel } = useGradeLevel({ isTeacher: false, selectedStudentId: null });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            throw error;
          }

          setFirstName(data?.first_name || '');
          setLastName(data?.last_name || '');
          setGradeLevel(data?.grade_level);
        }
      } catch (error: any) {
        toast({
          title: "Fehler",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            grade_level: gradeLevel,
          })
          .eq('id', user.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Profil aktualisiert",
          description: "Dein Profil wurde erfolgreich aktualisiert.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Passwort zurücksetzen",
        description: "Eine E-Mail zum Zurücksetzen deines Passworts wurde an deine E-Mail-Adresse gesendet.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGradeLevelChange = (newGradeLevel: number) => {
    updateGradeLevel(newGradeLevel);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Lade Profil...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profil</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="firstName">Vorname</Label>
          <Input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Nachname</Label>
          <Input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
          />
        </div>

        <div>
          <Label>Klassenstufe</Label>
          <GradeLevelSelector 
            currentGradeLevel={gradeLevel} 
            onGradeLevelChange={handleGradeLevelChange}
            disabled={isLoading}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          Profil aktualisieren
        </Button>
      </form>
      <div className="mt-6">
        <Button variant="secondary" onClick={handlePasswordReset} disabled={isLoading}>
          Passwort zurücksetzen
        </Button>
      </div>
    </div>
  );
};

export default Profile;
