import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Grade } from '@/types';

interface GradeFormProps {
  onSubmit: (grade: Omit<Grade, 'id'>) => void;
  onCancel?: () => void;
  subjectType?: 'main' | 'secondary';
  initialGrade?: Grade;
}

export const GradeForm = ({ 
  onSubmit, 
  onCancel, 
  subjectType = 'main',
  initialGrade 
}: GradeFormProps) => {
  const [value, setValue] = useState(initialGrade?.value.toString() || '');
  const [weight, setWeight] = useState(initialGrade?.weight.toString() || '1');
  const [type, setType] = useState<'oral' | 'written'>(initialGrade?.type || 'oral');
  const [date, setDate] = useState(initialGrade?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(initialGrade?.notes || '');

  useEffect(() => {
    if (initialGrade) {
      setValue(initialGrade.value.toString());
      setWeight(initialGrade.weight.toString());
      setType(initialGrade.type);
      setDate(initialGrade.date);
      setNotes(initialGrade.notes || '');
    }
  }, [initialGrade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      value: Math.round(Number(value)), // Round to whole numbers
      weight: Number(weight),
      type,
      date,
      notes,
    });
    if (!initialGrade) {
      setValue('');
      setWeight('1');
      setType('oral');
      setNotes('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="value">Note</Label>
          <Input
            id="value"
            type="number"
            min="1"
            max="6"
            step="1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="weight">Gewichtung</Label>
          <Input
            id="weight"
            type="number"
            min={type === 'oral' ? '0.5' : '1'}
            max="3"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Art</Label>
          <RadioGroup value={type} onValueChange={(value) => setType(value as 'oral' | 'written')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oral" id="oral" />
              <Label htmlFor="oral">Mündlich</Label>
            </div>
            {subjectType === 'main' && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="written" id="written" />
                <Label htmlFor="written">Schulaufgabe</Label>
              </div>
            )}
          </RadioGroup>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="date">Datum</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notizen</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optionale Notizen zur Note..."
            className="min-h-[100px]"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
        )}
        <Button type="submit">
          {initialGrade ? 'Speichern' : 'Hinzufügen'}
        </Button>
      </div>
    </form>
  );
};