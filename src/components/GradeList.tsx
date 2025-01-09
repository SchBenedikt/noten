import { Grade } from '@/types';
import { useState } from 'react';
import { GradeForm } from './GradeForm';
import { GradeListItem } from './grade/GradeListItem';
import { GradeTable } from './grade/GradeTable';
import { GradeDialogs } from './grade/GradeDialogs';

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
              <GradeListItem
                key={grade.id}
                grade={grade}
                onEdit={setEditingGradeId}
                onDelete={setDeletingGradeId}
                isDemo={isDemo}
                onDemoAction={handleDemoAction}
              />
            )
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block">
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
              <GradeTable
                key={grade.id}
                grades={[grade]}
                onEdit={setEditingGradeId}
                onDelete={setDeletingGradeId}
                isDemo={isDemo}
                onDemoAction={handleDemoAction}
              />
            )
          ))}
        </div>
      </div>

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