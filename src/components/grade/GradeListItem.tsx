import { Grade } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Pencil, Trash2, MessageSquare } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GradeListItemProps {
  grade: Grade;
  onEdit: (gradeId: string) => void;
  onDelete: (gradeId: string) => void;
  isDemo?: boolean;
  onDemoAction: () => void;
}

export const GradeListItem = ({ 
  grade, 
  onEdit, 
  onDelete, 
  isDemo = false,
  onDemoAction 
}: GradeListItemProps) => {
  return (
    <div className="p-4 bg-white border-b">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium">
          {new Date(grade.date).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {grade.value}
            {grade.value <= 2 ? (
              <ArrowUp className="inline ml-1 text-green-500" size={16} />
            ) : grade.value >= 5 ? (
              <ArrowDown className="inline ml-1 text-red-500" size={16} />
            ) : null}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>{grade.type === 'oral' ? 'Mündlich' : 'Schulaufgabe'}</div>
        <div className="flex items-center gap-2">
          <span>Gewichtung: {grade.weight}</span>
          {grade.notes && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm truncate max-w-[200px]">{grade.notes}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{grade.notes}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isDemo) {
                onDemoAction();
                return;
              }
              onEdit(grade.id);
            }}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isDemo) {
                onDemoAction();
                return;
              }
              onDelete(grade.id);
            }}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};
