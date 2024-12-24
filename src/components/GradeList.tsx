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
      <div className="min-w-full divide-y divide-gray-200">
        {/* Mobile View */}
        <div className="block sm:hidden">
          {sortedGrades.map((grade) => (
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingGradeId(grade.id)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingGradeId(grade.id)}
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

        {/* Desktop View */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Datum</TableHead>
                <TableHead className="w-[80px] text-right">Note</TableHead>
                <TableHead>Art</TableHead>
                <TableHead className="text-right">Gewichtung</TableHead>
                <TableHead className="w-[100px]">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGrades.map((grade) => (
                editingGradeId === grade.id ? (
                  <TableRow key={grade.id}>
                    <TableCell colSpan={5} className="p-0">
                      <div className="p-4 bg-gray-50">
                        <GradeForm
                          initialGrade={grade}
                          onSubmit={(updatedGrade) => {
                            onUpdateGrade(grade.id, updatedGrade);
                            setEditingGradeId(null);
                          }}
                          onCancel={() => setEditingGradeId(null)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
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
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingGradeId(grade.id)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingGradeId(grade.id)}
                          className="h-8 w-8"
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
        </div>
      </div>

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