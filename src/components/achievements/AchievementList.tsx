
import { Achievement } from '@/hooks/use-achievements';
import { AchievementCard } from './AchievementCard';

interface AchievementListProps {
  achievements: Achievement[];
}

export const AchievementList = ({ achievements }: AchievementListProps) => {
  if (achievements.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
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
