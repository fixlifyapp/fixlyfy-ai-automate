
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Achievement } from "@/types/gamification";
import { CheckCircle2 } from "lucide-react";

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

export const AchievementCard = ({ achievement, isUnlocked }: AchievementCardProps) => {
  const rarityColors = {
    common: "bg-gray-100 text-gray-800",
    rare: "bg-blue-100 text-blue-800",
    epic: "bg-purple-100 text-purple-800",
    legendary: "bg-yellow-100 text-yellow-800"
  };

  return (
    <Card className={`transition-all duration-200 ${isUnlocked ? 'ring-2 ring-green-500 bg-green-50' : 'opacity-75'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{achievement.icon}</div>
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                {achievement.name}
                {isUnlocked && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </h4>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
          </div>
          <Badge className={rarityColors[achievement.rarity]}>
            {achievement.rarity}
          </Badge>
        </div>
        
        {!isUnlocked && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(achievement.progress)}%</span>
            </div>
            <Progress value={achievement.progress} className="h-2" />
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-muted-foreground">
            Reward: {achievement.reward.points} points
            {achievement.reward.bonus && ` + $${achievement.reward.bonus} bonus`}
          </span>
          {isUnlocked && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Unlocked!
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
