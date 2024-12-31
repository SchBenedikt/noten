import { Grade } from '@/types';
import { useState } from 'react';
import { GradeListMobile } from './grade/GradeListMobile';
import { GradeListDesktop } from './grade/GradeListDesktop';
import { GradeDialogs } from './grade/GradeDialogs';

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
        <GradeListMobile
          grades={sortedGrades}
          editingGradeId={editingGradeId}
          onUpdateGrade={onUpdateGrade}
          handleEditClick={handleEditClick}
          handleDeleteClick={handleDeleteClick}
          setEditingGradeId={setEditingGradeId}
        />

        <GradeListDesktop
          grades={sortedGrades}
          editingGradeId={editingGradeId}
          onUpdateGrade={onUpdateGrade}
          handleEditClick={handleEditClick}
          handleDeleteClick={handleDeleteClick}
          setEditingGradeId={setEditingGradeId}
        />
      </div>

      <GradeDialogs
        showLoginDialog={showLoginDialog}
        setShowLoginDialog={setShowLoginDialog}
        deletingGradeId={deletingGradeId}
        setDeletingGradeId={setDeletingGradeId}
        onDeleteGrade={onDeleteGrade}
      />
    </div>
  );
};