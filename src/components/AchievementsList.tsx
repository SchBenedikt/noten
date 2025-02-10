import { Achievement } from "@/types";
import { Trophy, Star, TrendingUp, GraduationCap, BookOpen, Award, Medal, Edit, Trash } from "lucide-react";
import { motion } from "framer-motion";
import { fetchAndCreateMissingAchievements } from "@/lib/achievements";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

interface AchievementsListProps {
  achievements: Achievement[];
  onEdit?: (achievement: Achievement) => void;
  onDelete?: (achievementId: string) => void;
}

const achievementInfo = {
  first_grade: {
    title: "Erste Note",
    description: "Erste Note des Schuljahres eingetragen",
    icon: Trophy,
  },
  grade_streak: {
    title: "Notenserie",
    description: "Noten an aufeinanderfolgenden Tagen eingetragen",
    icon: TrendingUp,
  },
  perfect_grade: {
    title: "Perfekte Note",
    description: "Eine 1,0 erreicht",
    icon: Star,
  },
  improvement: {
    title: "Verbesserung",
    description: "Durchschnitt in einem Fach verbessert",
    icon: TrendingUp,
  },
  subject_master: {
    title: "Fachmeister",
    description: "Durchschnitt von 2,0 oder besser in einem Fach",
    icon: GraduationCap,
  },
  grade_collector: {
    title: "Notensammler",
    description: "10 Noten eingetragen",
    icon: BookOpen,
  },
  subject_collector: {
    title: "Fächersammler",
    description: "5 Fächer hinzugefügt",
    icon: Award,
  },
};

export const AchievementsList = ({ achievements, onEdit, onDelete }: AchievementsListProps) => {
  const location = useLocation();
  const isAdminPage = location.pathname.includes("/admin");

  useEffect(() => {
    fetchAndCreateMissingAchievements();
  }, []);

  if (achievements.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        Noch keine Auszeichnungen in diesem Schuljahr
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {achievements.map((achievement) => {
        const info = achievementInfo[achievement.type];
        const Icon = info.icon;

        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 border border-gray-300"
          >
            <div className="bg-primary/10 p-2 rounded-full">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="p-2 flex-1">
              <h3 className="font-medium">{info.title}</h3>
              <p className="text-sm text-gray-500">{info.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(achievement.earned_at).toLocaleDateString()}
              </p>
            </div>
            {isAdminPage && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => onEdit?.(achievement)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => onDelete?.(achievement.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
