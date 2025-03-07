
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { GraduationCap, PenTool } from "lucide-react";

interface RoleSelectorProps {
  value: 'student' | 'teacher';
  onChange: (value: 'student' | 'teacher') => void;
  disabled?: boolean;
}

export const RoleSelector = ({ value, onChange, disabled = false }: RoleSelectorProps) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium mb-2">Rolle:</div>
      <RadioGroup 
        value={value} 
        onValueChange={(value) => onChange(value as 'student' | 'teacher')}
        className="grid grid-cols-2 gap-4"
        disabled={disabled}
      >
        <div>
          <RadioGroupItem 
            value="student" 
            id="student-role" 
            className="peer sr-only" 
            disabled={disabled}
          />
          <Label
            htmlFor="student-role" 
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GraduationCap className="mb-3 h-6 w-6" />
            <span className="text-center">Schüler/in</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem 
            value="teacher" 
            id="teacher-role" 
            className="peer sr-only" 
            disabled={disabled}
          />
          <Label
            htmlFor="teacher-role" 
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PenTool className="mb-3 h-6 w-6" />
            <span className="text-center">Lehrer/in</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
