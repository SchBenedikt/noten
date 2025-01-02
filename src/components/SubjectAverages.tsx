import { Subject } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit2Icon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateMainSubjectAverages, calculateSecondarySubjectAverages } from '@/lib/calculations';

interface SubjectAveragesProps {
  subject: Subject;
  isEditingWeight: boolean;
  setIsEditingWeight: (value: boolean) => void;
  onUpdateSubject?: (subjectId: string, updates: Partial<Subject>) => void;
}

export const SubjectAverages = ({ 
  subject,
  isEditingWeight,
  setIsEditingWeight,
  onUpdateSubject
}: SubjectAveragesProps) => {
  const averages = subject.type === 'main' 
    ? calculateMainSubjectAverages(subject.grades, subject.writtenWeight || 2)
    : calculateSecondarySubjectAverages(subject.grades);

  const handleWeightChange = (value: string) => {
    if (onUpdateSubject) {
      onUpdateSubject(subject.id, { writtenWeight: Number(value) });
      setIsEditingWeight(false);
    }
  };

  if (subject.type === 'main') {
    const mainAverages = averages as ReturnType<typeof calculateMainSubjectAverages>;
    return (
      <div className="text-sm space-y-1 sm:space-y-0 sm:text-right bg-gray-50 p-2 rounded-md w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <span>Schulaufgaben: ∅ {mainAverages.written}</span>
          <div className="flex items-center gap-1">
            {isEditingWeight ? (
              <Select
                defaultValue={subject.writtenWeight?.toString() || "2"}
                onValueChange={handleWeightChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="×2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">×1</SelectItem>
                  <SelectItem value="2">×2</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <>
                <span>(×{subject.writtenWeight || 2})</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingWeight(true)}
                  className="h-6 w-6"
                >
                  <Edit2Icon className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
        <div>Mündlich: ∅ {mainAverages.oral}</div>
        <div className="font-semibold text-base">Gesamt: ∅ {mainAverages.total}</div>
      </div>
    );
  }

  return (
    <div className="text-sm space-y-1 sm:space-y-0 sm:text-right bg-gray-50 p-2 rounded-md w-full sm:w-auto">
      <div>Mündlich: ∅ {averages.oral}</div>
      <div className="font-semibold text-base">Gesamt: ∅ {averages.total}</div>
    </div>
  );
};