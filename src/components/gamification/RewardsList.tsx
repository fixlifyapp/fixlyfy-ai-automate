
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Reward } from "@/types/gamification";
import { Gift, DollarSign, Award, Trophy, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RewardsListProps {
  rewards: Reward[];
}

export const RewardsList = ({ rewards }: RewardsListProps) => {
  const typeIcons = {
    commission: <DollarSign className="h-4 w-4" />,
    bonus: <Gift className="h-4 w-4" />,
    recognition: <Award className="h-4 w-4" />,
    prize: <Trophy className="h-4 w-4" />
  };

  const typeColors = {
    commission: "bg-green-100 text-green-800",
    bonus: "bg-blue-100 text-blue-800",
    recognition: "bg-purple-100 text-purple-800",
    prize: "bg-yellow-100 text-yellow-800"
  };

  if (rewards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No rewards earned yet. Keep selling to unlock bonuses!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rewards.map((reward) => (
        <div key={reward.id} className={`p-4 border rounded-lg transition-all duration-200 ${
          reward.isEarned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${reward.isEarned ? 'bg-green-100' : 'bg-gray-100'}`}>
                {typeIcons[reward.type]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{reward.name}</h4>
                  {reward.isEarned && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                </div>
                <p className="text-sm text-muted-foreground">{reward.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Requirement: {reward.requirement}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                ${reward.value}
              </div>
              <Badge className={typeColors[reward.type]}>
                {reward.type}
              </Badge>
              {reward.isEarned && reward.earnedAt && (
                <div className="text-xs text-green-600 mt-1">
                  Earned {formatDistanceToNow(new Date(reward.earnedAt), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
