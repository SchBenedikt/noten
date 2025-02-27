
import { Achievement } from '@/hooks/use-achievements';
import { AchievementCard } from './AchievementCard';
import { Loader2 } from 'lucide-react';

interface AchievementListProps {
  achievements: Achievement[];
  loading?: boolean;
}

export const AchievementList = ({ achievements, loading }: AchievementListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Noch keine Achievements freigeschaltet
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
};
