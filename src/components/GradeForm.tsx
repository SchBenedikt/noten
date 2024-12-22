import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import { Grade } from '@/types';

interface GradeFormProps {
  onSubmit: (grade: Omit<Grade, 'id'>) => void;
}

export const GradeForm = ({ onSubmit }: GradeFormProps) => {
  const [value, setValue] = useState('');
  const [weight, setWeight] = useState('1');
  const [type, setType] = useState<'oral' | 'written'>('written');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = Number(value);
    const numWeight = Number(weight);

    if (numValue < 1 || numValue > 6 || isNaN(numValue)) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine gültige Note zwischen 1 und 6 ein.",
        variant: "destructive",
      });
      return;
    }

    if (numWeight <= 0 || isNaN(numWeight)) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine gültige Gewichtung größer als 0 ein.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      value: numValue,
      weight: numWeight,
      type,
      date,
    });

    setValue('');
    setWeight('1');
    setType('written');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">Note</Label>
          <Input
            id="value"
            type="number"
            min="1"
            max="6"
            step="1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="1-6"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Gewichtung</Label>
          <Input
            id="weight"
            type="number"
            min="0.5"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notenart</Label>
        <RadioGroup value={type} onValueChange={(value: 'oral' | 'written') => setType(value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="written" id="written" />
            <Label htmlFor="written">Schulaufgabe</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="oral" id="oral" />
            <Label htmlFor="oral">Mündliche Note</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Datum</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">Note hinzufügen</Button>
    </form>
  );
};