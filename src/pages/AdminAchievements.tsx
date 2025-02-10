import { useAchievements, addAchievement, updateAchievement, deleteAchievement } from "@/hooks/use-achievements";
import { AdminAchievementForm } from "@/components/AdminAchievementForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AdminAchievements = () => {
  const { data: achievements = [], isLoading } = useAchievements();
  const navigate = useNavigate();
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const handleAddAchievement = async (achievement) => {
    await addAchievement(achievement);
  };

  const handleUpdateAchievement = async (achievement) => {
    await updateAchievement(achievement);
  };

  const handleDeleteAchievement = async (achievementId) => {
    await deleteAchievement(achievementId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p>Laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold">Admin Auszeichnungen</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <AdminAchievementForm
              onSubmit={handleAddAchievement}
              achievement={selectedAchievement}
              onUpdate={handleUpdateAchievement}
              onDelete={handleDeleteAchievement}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Bestehende Auszeichnungen</h2>
            <ul className="space-y-4">
              {achievements.map((achievement) => (
                <li key={achievement.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{achievement.title}</h3>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedAchievement(achievement)}>
                      Bearbeiten
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteAchievement(achievement.id)}>
                      Löschen
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAchievements;
