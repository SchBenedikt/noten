import { Grade } from '@/types';
import { useState } from 'react';
import { GradeForm } from './GradeForm';
import { GradeListItem } from './grade/GradeListItem';
import { DataTable } from './grade/DataTable';
import { GradeDialogs } from './grade/GradeDialogs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface GradeListProps {
  grades: Grade[];
  onUpdateGrade: (gradeId: string, grade: Omit<Grade, 'id'>) => void;
  onDeleteGrade: (gradeId: string) => void;
  isDemo?: boolean;
}

export const GradeList = ({ 
  grades, 
  onUpdateGrade, 
  onDeleteGrade, 
  isDemo = false 
}: GradeListProps) => {
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [deletingGradeId, setDeletingGradeId] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isEditSheetOpen, setEditSheetOpen] = useState(false);
  
  const sortedGrades = [...grades].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDemoAction = () => {
    setShowLoginDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingGradeId) {
      onDeleteGrade(deletingGradeId);
      setDeletingGradeId(null);
    }
  };

  const handleEdit = (gradeId: string) => {
    setEditingGradeId(gradeId);
    setEditSheetOpen(true);
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-full divide-y divide-gray-200">
        {/* Mobile View */}
        <div className="block sm:hidden">
          {sortedGrades.map((grade) => (
            <GradeListItem
              key={grade.id}
              grade={grade}
              onEdit={handleEdit}
              onDelete={setDeletingGradeId}
              isDemo={isDemo}
              onDemoAction={handleDemoAction}
            />
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block">
          <DataTable
            grades={sortedGrades}
            onEdit={handleEdit}
            onDelete={setDeletingGradeId}
            isDemo={isDemo}
            onDemoAction={handleDemoAction}
          />
        </div>
      </div>

      <Sheet open={isEditSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Note bearbeiten</SheetTitle>
          </SheetHeader>
          {editingGradeId && (
            <GradeForm
              initialGrade={grades.find(grade => grade.id === editingGradeId)}
              onSubmit={(updatedGrade) => {
                onUpdateGrade(editingGradeId, updatedGrade);
                setEditSheetOpen(false);
              }}
              onCancel={() => setEditSheetOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <GradeDialogs
        showLoginDialog={showLoginDialog}
        showDeleteDialog={deletingGradeId !== null}
        onLoginDialogChange={setShowLoginDialog}
        onDeleteDialogChange={(open) => !open && setDeletingGradeId(null)}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
