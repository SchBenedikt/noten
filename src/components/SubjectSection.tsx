import { Subject } from '@/types';
import { SubjectCard } from './SubjectCard';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface SubjectSectionProps {
  title: string;
  subjects: Subject[];
  type: 'main' | 'secondary';
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  onUpdateGrade: (subjectId: string, gradeId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  onDeleteGrade: (subjectId: string, gradeId: string) => Promise<void>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onUpdateSubject?: (subjectId: string, updates: Partial<Subject>) => Promise<void>;
  isDemo?: boolean;
  lastActiveSubjectId: string | null;
  searchQuery: string;
  searchType: 'subject' | 'grade' | 'note';
}

export const SubjectSection = ({
  title,
  subjects,
  type,
  isOpen,
  setIsOpen,
  onAddGrade,
  onUpdateGrade,
  onDeleteGrade,
  onDeleteSubject,
  onUpdateSubject,
  isDemo = false,
  lastActiveSubjectId,
  searchQuery,
  searchType,
}: SubjectSectionProps) => {
  if (subjects.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isOpen ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onAddGrade={onAddGrade}
              onUpdateGrade={onUpdateGrade}
              onDeleteGrade={onDeleteGrade}
              onDeleteSubject={onDeleteSubject}
              onUpdateSubject={onUpdateSubject}
              isDemo={isDemo}
              isInitiallyOpen={subject.id === lastActiveSubjectId}
              searchQuery={searchQuery}
              searchType={searchType}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};