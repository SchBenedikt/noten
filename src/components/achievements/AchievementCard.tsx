
import { Achievement, AchievementType } from '@/hooks/use-achievements';
import { Award, Trophy, Medal, Star } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const achievementInfo: Record<AchievementType, { title: string; description: string; icon: JSX.Element }> = {
  first_grade: {
    title: "Erste Note",
    description: "Du hast deine erste Note erhalten!",
    icon: <Award className="h-6 w-6 text-blue-500" />
  },
  perfect_grade: {
    title: "Perfekte Note",
    description: "Du hast eine 1,0 erreicht!",
    icon: <Star className="h-6 w-6 text-yellow-500" />
  },
  grade_collector: {
    title: "Notensammler",
    description: "Du hast 10 Noten in diesem Schuljahr gesammelt!",
    icon: <Medal className="h-6 w-6 text-purple-500" />
  },
  subject_collector: {
    title: "Fächersammler",
    description: "Du hast 5 Fächer in diesem Schuljahr angelegt!",
    icon: <Trophy className="h-6 w-6 text-green-500" />
  },
  grade_streak: {
    title: "Notenserie",
    description: "Eine Serie guter Noten!",
    icon: <Award className="h-6 w-6 text-orange-500" />
  },
  improvement: {
    title: "Verbesserung",
    description: "Du hast dich verbessert!",
    icon: <Award className="h-6 w-6 text-indigo-500" />
  },
  subject_master: {
    title: "Fachmeister",
    description: "Meisterleistung in einem Fach!",
    icon: <Trophy className="h-6 w-6 text-red-500" />
  }
};

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard = ({ achievement }: AchievementCardProps) => {
  const info = achievementInfo[achievement.type];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        {info.icon}
        <div>
          <CardTitle className="text-lg">{info.title}</CardTitle>
          <CardDescription>
            {new Date(achievement.earned_at).toLocaleDateString()}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{info.description}</p>
      </CardContent>
    </Card>
  );
};
