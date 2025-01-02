import { Button } from '@/components/ui/button';
import { PlusIcon, MinusIcon, Trash2Icon } from 'lucide-react';

interface SubjectActionsProps {
  isAddingGrade: boolean;
  onGradeActionClick: () => void;
  onDeleteClick: () => void;
}

export const SubjectActions = ({
  isAddingGrade,
  onGradeActionClick,
  onDeleteClick
}: SubjectActionsProps) => {
  return (
    <div className="flex gap-2 w-full sm:w-auto justify-end">
      <Button
        variant="ghost"
        size="icon"
        onClick={onGradeActionClick}
        className="hover:bg-gray-100"
      >
        {isAddingGrade ? <MinusIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDeleteClick}
        className="hover:bg-red-50"
      >
        <Trash2Icon className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};