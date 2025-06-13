
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Goal } from "@/types/gamification";
import { Target, Clock, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GoalProgressProps {
  goal: Goal;
}

export const GoalProgress = ({ goal }: GoalProgressProps) => {
  const progress = (goal.current / goal.target) * 100;
  const timeLeft = formatDistanceToNow(new Date(goal.deadline), { addSuffix: true });
  const isNearDeadline = new Date(goal.deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000;

  const typeIcons = {
    daily: <Clock className="h-4 w-4" />,
    weekly: <Target className="h-4 w-4" />,
    monthly: <DollarSign className="h-4 w-4" />
  };

  const typeColors = {
    daily: "bg-blue-100 text-blue-800",
    weekly: "bg-green-100 text-green-800",
    monthly: "bg-purple-100 text-purple-800"
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            {typeIcons[goal.type]}
          </div>
          <div>
            <h4 className="font-medium">{goal.name}</h4>
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge className={typeColors[goal.type]}>
            {goal.type}
          </Badge>
          <div className="text-sm text-muted-foreground mt-1">
            ${goal.reward} reward
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress: {goal.current} / {goal.target}</span>
          <span className={isNearDeadline ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
            {timeLeft}
          </span>
        </div>
        <Progress 
          value={progress} 
          className={`h-3 ${progress >= 100 ? 'bg-green-100' : ''}`}
        />
        {progress >= 100 && (
          <div className="text-sm text-green-600 font-medium flex items-center gap-1">
            🎉 Goal completed! Reward earned.
          </div>
        )}
      </div>
    </div>
  );
};
