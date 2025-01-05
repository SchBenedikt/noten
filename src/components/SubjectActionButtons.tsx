import { Button } from '@/components/ui/button';
import { PlusIcon, MinusIcon, Trash2Icon, GraduationCapIcon, BookOpenIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubjectActionButtonsProps {
  isAddingGrade: boolean;
  onAddGradeClick: () => void;
  onDeleteClick: () => void;
  isDemo?: boolean;
}

export const SubjectActionButtons = ({
  isAddingGrade,
  onAddGradeClick,
  onDeleteClick,
  isDemo = false
}: SubjectActionButtonsProps) => {
  return (
    <div className="flex gap-2 w-full sm:w-auto justify-end">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddGradeClick}
          className="hover:bg-gray-100 transition-colors duration-200"
        >
          {isAddingGrade ? (
            <MinusIcon className="h-4 w-4 text-red-500" />
          ) : (
            <PlusIcon className="h-4 w-4 text-green-500" />
          )}
        </Button>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onDeleteClick}
          className="hover:bg-red-50 transition-colors duration-200"
        >
          <Trash2Icon className="h-4 w-4 text-red-500" />
        </Button>
      </motion.div>
    </div>
  );
};