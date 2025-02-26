
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Achievement } from '@/hooks/use-achievements';
import { AchievementCard } from './AchievementCard';

interface AchievementDialogProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementDialog = ({ achievement, onClose }: AchievementDialogProps) => {
  return (
    <Dialog open={!!achievement} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Achievement freigeschaltet! 🎉</DialogTitle>
        </DialogHeader>
        {achievement && <AchievementCard achievement={achievement} />}
      </DialogContent>
    </Dialog>
  );
};
