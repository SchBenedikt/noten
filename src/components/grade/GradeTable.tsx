import { Grade } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Pencil, Trash2, MessageSquare } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GradeTableProps {
  grades: Grade[];
  onEdit: (gradeId: string) => void;
  onDelete: (gradeId: string) => void;
  isDemo?: boolean;
  onDemoAction: () => void;
}

export const GradeTable = ({ 
  grades, 
  onEdit, 
  onDelete, 
  isDemo = false,
  onDemoAction 
}: GradeTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Datum</TableHead>
          <TableHead className="w-[80px] text-right">Note</TableHead>
          <TableHead>Art</TableHead>
          <TableHead className="text-right">Gewichtung</TableHead>
          <TableHead>Notizen</TableHead>
          <TableHead className="w-[100px]">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {grades.map((grade) => (
          <TableRow key={grade.id}>
            <TableCell className="font-medium">
              {new Date(grade.date).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right whitespace-nowrap">
              {grade.value}
              {grade.value <= 2 ? (
                <ArrowUp className="inline ml-1 text-green-500" size={16} />
              ) : grade.value >= 5 ? (
                <ArrowDown className="inline ml-1 text-red-500" size={16} />
              ) : null}
            </TableCell>
            <TableCell>
              {grade.type === 'oral' ? 'Mündlich' : 'Schulaufgabe'}
            </TableCell>
            <TableCell className="text-right">{grade.weight}</TableCell>
            <TableCell>
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
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};