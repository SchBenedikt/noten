import { motion } from 'framer-motion';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface SubjectAveragesProps {
  type: 'main' | 'secondary';
  averages: {
    written?: number;
    oral: number;
    total: number;
  };
  writtenWeight?: number;
  onWeightEdit?: () => void;
  isEditingWeight?: boolean;
  children?: React.ReactNode;
}

export const SubjectAverages = ({
  type,
  averages,
  writtenWeight,
  children
}: SubjectAveragesProps) => {
  const isImproving = averages.total >= 2.0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-sm space-y-1 sm:space-y-0 sm:text-right bg-gray-50 p-2 rounded-md w-full sm:w-auto"
    >
      {type === 'main' && (
        <div className="flex items-center gap-2 justify-end">
          <span>Schulaufgaben: ∅ {averages.written}</span>
          <span>(×{writtenWeight || 2})</span>
          {children}
        </div>
      )}
      <div>Mündlich: ∅ {averages.oral}</div>
      <div className="font-semibold text-base flex items-center gap-2 justify-end">
        Gesamt: ∅ {averages.total}
        {isImproving ? (
          <TrendingUpIcon className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDownIcon className="h-4 w-4 text-red-500" />
        )}
      </div>
    </motion.div>
  );
};