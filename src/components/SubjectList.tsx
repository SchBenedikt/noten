import { Subject, Grade } from '@/types';
import { SubjectCard } from './SubjectCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { SubjectSearch } from './SubjectSearch';

interface SubjectListProps {
  subjects: Subject[];
  onAddGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  onUpdateGrade: (subjectId: string, gradeId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  onDeleteGrade: (subjectId: string, gradeId: string) => Promise<void>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onUpdateSubject?: (subjectId: string, updates: Partial<Subject>) => Promise<void>;
  isDemo?: boolean;
}

export const SubjectList = ({
  subjects,
  onAddGrade,
  onUpdateGrade,
  onDeleteGrade,
  onDeleteSubject,
  onUpdateSubject,
  isDemo = false
}: SubjectListProps) => {
  const [mainSubjectsOpen, setMainSubjectsOpen] = useState(false);
  const [secondarySubjectsOpen, setSecondarySubjectsOpen] = useState(false);
  const [lastActiveSubjectId, setLastActiveSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'subject' | 'grade' | 'note'>('subject');

  // Memoize filtered subjects
  const filteredSubjects = useMemo(() => {
    if (!searchQuery) return subjects;
    
    return subjects.filter(subject => 
      hasMatch(subject, searchQuery, searchType)
    );
  }, [subjects, searchQuery, searchType]);

  // Memoize main and secondary subjects
  const { mainSubjects, secondarySubjects } = useMemo(() => {
    return {
      mainSubjects: filteredSubjects.filter(subject => subject.type === 'main'),
      secondarySubjects: filteredSubjects.filter(subject => subject.type === 'secondary')
    };
  }, [filteredSubjects]);

  const hasMatch = (subject: Subject, query: string, type: 'subject' | 'grade' | 'note') => {
    const lowercaseQuery = query.toLowerCase();
    
    switch (type) {
      case 'subject':
        return subject.name.toLowerCase().includes(lowercaseQuery);
      case 'grade':
        return subject.grades.some(grade => 
          grade.value.toString().includes(lowercaseQuery)
        );
      case 'note':
        return subject.grades.some(grade => 
          grade.notes?.toLowerCase().includes(lowercaseQuery)
        );
      default:
        return false;
    }
  };

  if (subjects.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <p className="text-center text-gray-500">
          Noch keine Fächer vorhanden. Fügen Sie Ihr erstes Fach hinzu!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SubjectSearch
        searchQuery={searchQuery}
        searchType={searchType}
        onSearchChange={setSearchQuery}
        onSearchTypeChange={setSearchType}
      />
      
      <AnimatePresence>
        {searchQuery && filteredSubjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500"
          >
            Keine {searchType === 'subject' ? 'Fächer' : searchType === 'grade' ? 'Noten' : 'Notizen'} gefunden für "{searchQuery}"
          </motion.div>
        ) : (
          <>
            <SubjectSection 
              title="Hauptfächer" 
              subjects={mainSubjects} 
              type="main" 
              isOpen={mainSubjectsOpen}
              setIsOpen={setMainSubjectsOpen}
              onAddGrade={onAddGrade}
              onUpdateGrade={onUpdateGrade}
              onDeleteGrade={onDeleteGrade}
              onDeleteSubject={onDeleteSubject}
              onUpdateSubject={onUpdateSubject}
              isDemo={isDemo}
              lastActiveSubjectId={lastActiveSubjectId}
              searchQuery={searchQuery}
              searchType={searchType}
            />
            <SubjectSection 
              title="Nebenfächer" 
              subjects={secondarySubjects} 
              type="secondary" 
              isOpen={secondarySubjectsOpen}
              setIsOpen={setSecondarySubjectsOpen}
              onAddGrade={onAddGrade}
              onUpdateGrade={onUpdateGrade}
              onDeleteGrade={onDeleteGrade}
              onDeleteSubject={onDeleteSubject}
              onUpdateSubject={onUpdateSubject}
              isDemo={isDemo}
              lastActiveSubjectId={lastActiveSubjectId}
              searchQuery={searchQuery}
              searchType={searchType}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
