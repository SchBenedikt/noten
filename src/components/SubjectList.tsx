import { Subject, Grade } from '@/types';
import { SubjectCard } from './SubjectCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SubjectSearch } from './SubjectSearch';
import { GradeLevelSelector } from './GradeLevelSelector';
import { useProfile } from '@/hooks/use-profile';

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
  const { profile, updateProfile } = useProfile();
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(profile?.grade_level || 5);

  useEffect(() => {
    if (profile?.grade_level) {
      setSelectedGradeLevel(profile.grade_level);
    }
  }, [profile?.grade_level]);

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

  const handleGradeLevelChange = async (level: number) => {
    if (profile?.id) {
      await updateProfile({ grade_level: level });
      setSelectedGradeLevel(level);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <SubjectSearch
          searchQuery={searchQuery}
          searchType={searchType}
          onSearchChange={setSearchQuery}
          onSearchTypeChange={setSearchType}
        />
        <GradeLevelSelector
          currentGradeLevel={selectedGradeLevel}
          onGradeLevelChange={handleGradeLevelChange}
        />
      </div>
      
      {subjects.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <p className="text-center text-gray-500">
            Noch keine Fächer vorhanden. Fügen Sie Ihr erstes Fach hinzu!
          </p>
        </div>
      ) : (
        <>
          {subjects.filter(subject => subject.type === 'main').length > 0 && (
            <Collapsible open={mainSubjectsOpen} onOpenChange={setMainSubjectsOpen}>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Hauptfächer</h2>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 transition-transform duration-200 ${mainSubjectsOpen ? 'rotate-180' : ''}`}
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <motion.div 
                    className="p-4 grid gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={mainSubjectsOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  >
                    {subjects.filter(subject => subject.type === 'main').map((subject) => (
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
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
          {subjects.filter(subject => subject.type === 'secondary').length > 0 && (
            <Collapsible open={secondarySubjectsOpen} onOpenChange={setSecondarySubjectsOpen}>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Nebenfächer</h2>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 transition-transform duration-200 ${secondarySubjectsOpen ? 'rotate-180' : ''}`}
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <motion.div 
                    className="p-4 grid gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={secondarySubjectsOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  >
                    {subjects.filter(subject => subject.type === 'secondary').map((subject) => (
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
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}
        </>
      )}
    </div>
  );
};
