
import { Subject, Grade } from '@/types';
import { SubjectCard } from './SubjectCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SubjectSearch } from './SubjectSearch';

interface SubjectListProps {
  subjects: Subject[];
  onAddGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  onUpdateGrade: (subjectId: string, gradeId: string, grade: Omit<Grade, 'id'>) => Promise<void>;
  onDeleteGrade: (subjectId: string, gradeId: string) => Promise<void>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onUpdateSubject?: (subjectId: string, updates: Partial<Subject>) => Promise<void>;
  isDemo?: boolean;
  onAddGradeClick?: (subjectId: string) => void;
  studentName?: string;
}

export const SubjectList = ({
  subjects,
  onAddGrade,
  onUpdateGrade,
  onDeleteGrade,
  onDeleteSubject,
  onUpdateSubject,
  isDemo = false,
  onAddGradeClick,
  studentName
}: SubjectListProps) => {
  const [mainSubjectsOpen, setMainSubjectsOpen] = useState(false);
  const [secondarySubjectsOpen, setSecondarySubjectsOpen] = useState(false);
  const [lastActiveSubjectId, setLastActiveSubjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'subject' | 'grade' | 'note'>('subject');

  // Automatically expand or collapse sections based on search results
  useEffect(() => {
    if (searchQuery) {
      const hasMainMatches = subjects.some(subject => 
        hasMatch(subject, searchQuery, searchType)
      );
      const hasSecondaryMatches = subjects.some(subject => 
        subject.type === 'secondary' && hasMatch(subject, searchQuery, searchType)
      );
      
      setMainSubjectsOpen(hasMainMatches);
      setSecondarySubjectsOpen(hasSecondaryMatches);
    } else {
      setMainSubjectsOpen(false);
      setSecondarySubjectsOpen(false);
    }
  }, [searchQuery, searchType, subjects]);

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

  const filteredSubjects = subjects.filter(subject => 
    hasMatch(subject, searchQuery, searchType)
  );

  const mainSubjects = filteredSubjects.filter(subject => subject.type === 'main');
  const secondarySubjects = filteredSubjects.filter(subject => subject.type === 'secondary');

  const handleAddGrade = async (subjectId: string, grade: Omit<Grade, 'id'>) => {
    await onAddGrade(subjectId, grade);
    const subject = subjects.find(s => s.id === subjectId);
    if (subject?.type === 'main') {
      setMainSubjectsOpen(true);
    } else {
      setSecondarySubjectsOpen(true);
    }
    setLastActiveSubjectId(subjectId);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const SubjectSection = ({ 
    title, 
    subjects, 
    type, 
    isOpen, 
    setIsOpen 
  }: { 
    title: string; 
    subjects: Subject[]; 
    type: 'main' | 'secondary';
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }) => {
    if (subjects.length === 0) return null;
    
    const totalGrades = subjects.reduce((sum, subject) => sum + subject.grades.length, 0);
    
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            {!isOpen && (
              <div className="text-sm text-gray-500 mt-1 space-y-1">
                <p>{subjects.length} {subjects.length === 1 ? 'Fach' : 'Fächer'}</p>
                <p>{totalGrades} {totalGrades === 1 ? 'Note' : 'Noten'}</p>
              </div>
            )}
          </div>
          <CollapsibleContent>
            <motion.div 
              className="p-4 grid gap-4"
              variants={container}
              initial="hidden"
              animate={isOpen ? "show" : "hidden"}
            >
              {subjects.map((subject) => (
                <motion.div key={subject.id} variants={item}>
                  <SubjectCard
                    subject={subject}
                    onAddGrade={handleAddGrade}
                    onUpdateGrade={onUpdateGrade}
                    onDeleteGrade={onDeleteGrade}
                    onDeleteSubject={onDeleteSubject}
                    onUpdateSubject={onUpdateSubject}
                    isDemo={isDemo}
                    isInitiallyOpen={subject.id === lastActiveSubjectId}
                    searchQuery={searchQuery}
                    searchType={searchType}
                    studentName={studentName}
                  />
                </motion.div>
              ))}
            </motion.div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-6">
      <SubjectSearch
        searchQuery={searchQuery}
        searchType={searchType}
        onSearchChange={setSearchQuery}
        onSearchTypeChange={setSearchType}
      />
      {searchQuery && filteredSubjects.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
          Keine {searchType === 'subject' ? 'Fächer' : searchType === 'grade' ? 'Noten' : 'Notizen'} gefunden für "{searchQuery}"
        </div>
      ) : (
        <>
          <SubjectSection 
            title="Hauptfächer" 
            subjects={mainSubjects} 
            type="main" 
            isOpen={mainSubjectsOpen}
            setIsOpen={setMainSubjectsOpen}
          />
          <SubjectSection 
            title="Nebenfächer" 
            subjects={secondarySubjects} 
            type="secondary" 
            isOpen={secondarySubjectsOpen}
            setIsOpen={setSecondarySubjectsOpen}
          />
        </>
      )}
    </div>
  );
};
