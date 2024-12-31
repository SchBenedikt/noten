import { Grade } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown, Pencil, Trash2, MessageSquare } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GradeListProps {
  grades: Grade[];
  onUpdateGrade: (gradeId: string, grade: Omit<Grade, 'id'>) => void;
  onDeleteGrade: (gradeId: string) => void;
  isDemo?: boolean;
}

export const GradeList = ({ grades, onUpdateGrade, onDeleteGrade, isDemo = false }: GradeListProps) => {
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [deletingGradeId, setDeletingGradeId] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const sortedGrades = [...grades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEditClick = () => {
    if (isDemo) {
      setShowLoginDialog(true);
      return;
    }
    setEditingGradeId(null);
  };

  const handleDeleteClick = () => {
    if (isDemo) {
      setShowLoginDialog(true);
      return;
    }
    setDeletingGradeId(null);
  };

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

        {/* Desktop View */}
        <div className="hidden sm:block">
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
              {sortedGrades.map((grade) => (
                editingGradeId === grade.id ? (
                  <TableRow key={grade.id}>
                    <TableCell colSpan={6} className="p-0">
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
                    </TableCell>
                  </TableRow>
                )
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrierung erforderlich</AlertDialogTitle>
            <AlertDialogDescription>
              Um Noten zu bearbeiten und zu speichern, erstellen Sie bitte ein kostenloses Konto. 
              So können Sie Ihre Noten dauerhaft speichern und von überall darauf zugreifen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={() => window.location.href = '/login'}>
                Jetzt registrieren
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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