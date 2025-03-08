import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface GradeTypeSelectorProps {
  type: 'oral' | 'written';
  onChange: (type: 'oral' | 'written') => void;
  subjectType?: 'main' | 'secondary';
}

export const GradeTypeSelector = ({ type, onChange, subjectType = 'main' }: GradeTypeSelectorProps) => {
  // Wenn es ein Nebenfach ist, zeigen wir nur die mündliche Option an
  if (subjectType === 'secondary') {
    return (
      <div className="grid gap-2">
        <Label>Art</Label>
        <RadioGroup 
          value="oral" 
          onValueChange={(value) => onChange(value as 'oral' | 'written')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="oral" id="oral" />
            <Label htmlFor="oral">Mündlich</Label>
          </div>
        </RadioGroup>
      </div>
    );
  }

  // Für Hauptfächer zeigen wir beide Optionen an
  return (
    <div className="grid gap-2">
      <Label>Art</Label>
      <RadioGroup 
        value={type} 
        onValueChange={(value) => onChange(value as 'oral' | 'written')}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="oral" id="oral" />
          <Label htmlFor="oral">Mündlich</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="written" id="written" />
          <Label htmlFor="written">Schulaufgabe</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
