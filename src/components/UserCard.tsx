import { User } from '@/hooks/use-follow';
import { Button } from '@/components/ui/button';
import { UserCircle, UserPlus, UserMinus, School } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface UserCardProps {
  user: User;
  onToggleFollow: (userId: string) => void;
}

export const UserCard = ({ user, onToggleFollow }: UserCardProps) => {
  return (
    <Card className="w-full mb-4">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
            {user.first_name ? (
              <span className="text-xl font-semibold">
                {user.first_name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <UserCircle className="w-8 h-8 text-primary" />
            )}
          </div>
          
          <div>
            <h3 className="font-medium">
              {user.first_name || 'Unbenannter Benutzer'}
            </h3>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <School className="w-4 h-4 mr-1" />
              <span>Klasse {user.grade_level}</span>
            </div>
          </div>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={user.following ? "outline" : "default"}
              size="sm"
              onClick={() => onToggleFollow(user.id)}
            >
              {user.following ? (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Entfolgen
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Folgen
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {user.following ? "Entfolgen" : "Folgen"}
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );
};
