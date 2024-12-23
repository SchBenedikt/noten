import { Grade } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { GradeForm } from './GradeForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GradeListProps {
  grades: Grade[];
  onUpdateGrade: (gradeId: string, grade: Omit<Grade, 'id'>) => void;
  onDeleteGrade: (gradeId: string) => void;
}

export const GradeList = ({ grades, onUpdateGrade, onDeleteGrade }: GradeListProps) => {
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [deletingGradeId, setDeletingGradeId] = useState<string | null>(null);
  const sortedGrades = [...grades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Datum</TableHead>
            <TableHead className="w-[80px] text-right">Note</TableHead>
            <TableHead className="hidden sm:table-cell">Art</TableHead>
            <TableHead className="text-right">Gewichtung</TableHead>
            <TableHead className="w-[100px]">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedGrades.map((grade) => (
            editingGradeId === grade.id ? (
              <TableRow key={grade.id}>
                <TableCell colSpan={5}>
                  <GradeForm
                    initialGrade={grade}
                    onSubmit={(updatedGrade) => {
                      onUpdateGrade(grade.id, updatedGrade);
                      setEditingGradeId(null);
                    }}
                    onCancel={() => setEditingGradeId(null)}
                  />
                </TableCell>
              </TableRow>
            ) : (
              <TableRow key={grade.id}>
                <TableCell className="font-medium">
                  {new Date(grade.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {grade.value}
                  {grade.value <= 2 ? (
                    <ArrowUp className="inline ml-1 text-green-500" size={16} />
                  ) : grade.value >= 5 ? (
                    <ArrowDown className="inline ml-1 text-red-500" size={16} />
                  ) : null}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {grade.type === 'oral' ? 'Mündlich' : 'Schulaufgabe'}
                </TableCell>
                <TableCell className="text-right">{grade.weight}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingGradeId(grade.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingGradeId(grade.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          ))}
        </TableBody>
      </Table>

      <AlertDialog 
        open={deletingGradeId !== null} 
        onOpenChange={() => setDeletingGradeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Note löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Note wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingGradeId) {
                  onDeleteGrade(deletingGradeId);
                  setDeletingGradeId(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};