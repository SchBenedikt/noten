import { Grade } from '@/types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GradeForm } from '../GradeForm';

interface GradeListMobileProps {
  grades: Grade[];
  editingGradeId: string | null;
  onUpdateGrade: (gradeId: string, grade: Omit<Grade, 'id'>) => void;
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  setEditingGradeId: (id: string | null) => void;
}

export const GradeListMobile = ({
  grades,
  editingGradeId,
  onUpdateGrade,
  handleEditClick,
  handleDeleteClick,
  setEditingGradeId
}: GradeListMobileProps) => {
  return (
    <div className="block sm:hidden">
      {grades.map((grade) => (
        editingGradeId === grade.id ? (
          <div key={grade.id} className="p-4 bg-gray-50">
            <GradeForm
              initialGrade={grade}
              onSubmit={(updatedGrade) => {
                onUpdateGrade(grade.id, updatedGrade);
                setEditingGradeId(null);
              }}
              onCancel={() => setEditingGradeId(null)}
            />
          </div>
        ) : (
          <div key={grade.id} className="p-4 bg-white border-b">
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
                        <MessageSquare className="h-4 w-4 text-gray-400" />
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
                  onClick={handleEditClick}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteClick}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  );
};