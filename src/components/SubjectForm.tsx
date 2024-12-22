import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import { Subject, SubjectType } from '@/types';

interface SubjectFormProps {
  onSubmit: (subject: Omit<Subject, 'id' | 'grades'>) => void;
}

export const SubjectForm = ({ onSubmit }: SubjectFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<SubjectType>('main');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Fachnamen ein.",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({ name, type });
    setName('');
    setType('main');
    
    toast({
      title: "Erfolg",
      description: "Fach wurde erfolgreich hinzugefügt.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="space-y-2">
        <Label htmlFor="name">Fachname</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Mathematik"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Fachtyp</Label>
        <RadioGroup value={type} onValueChange={(value: SubjectType) => setType(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="main" id="main" />
            <Label htmlFor="main">Hauptfach</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="secondary" id="secondary" />
            <Label htmlFor="secondary">Nebenfach</Label>
          </div>
        </RadioGroup>
      </div>
      
      <Button type="submit" className="w-full">Fach hinzufügen</Button>
    </form>
  );
};