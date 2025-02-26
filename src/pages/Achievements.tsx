
import { useAchievements } from '@/hooks/use-achievements';
import { Trophy } from 'lucide-react';
import { AchievementList } from '@/components/achievements/AchievementList';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Achievements = () => {
  const { achievements } = useAchievements();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/')}
          >
            ← Zurück
          </Button>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Deine Achievements</h1>
          </div>
          <p className="text-gray-600">
            Hier findest du alle deine freigeschalteten Achievements und Erfolge.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <AchievementList achievements={achievements} />
        </div>
      </div>
    </div>
  );
};

export default Achievements;
