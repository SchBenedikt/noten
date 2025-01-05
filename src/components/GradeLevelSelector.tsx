import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GradeLevelSelectorProps {
  currentGradeLevel: number;
  onGradeLevelChange: (level: number) => void;
}

export const GradeLevelSelector = ({ currentGradeLevel, onGradeLevelChange }: GradeLevelSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Klassenstufe:</span>
      <Select
        value={currentGradeLevel.toString()}
        onValueChange={(value) => onGradeLevelChange(parseInt(value))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Wähle eine Klassenstufe" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 13 }, (_, i) => i + 1).map((level) => (
            <SelectItem key={level} value={level.toString()}>
              {level}. Klasse
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};