
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Competition, Participant } from "@/types/gamification";
import { Trophy, Calendar, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CompetitionCardProps {
  competition: Competition;
}

export const CompetitionCard = ({ competition }: CompetitionCardProps) => {
  const timeLeft = formatDistanceToNow(new Date(competition.endDate), { addSuffix: true });
  const totalDuration = new Date(competition.endDate).getTime() - new Date(competition.startDate).getTime();
  const elapsed = Date.now() - new Date(competition.startDate).getTime();
  const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);

  const currentUser = competition.participants.find(p => p.rank === 3); // Mock current user rank

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{competition.name}</h3>
              <p className="text-sm text-muted-foreground">{competition.description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            {competition.type}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Time Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Time remaining</span>
              <span className="font-medium">{timeLeft}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Current Position */}
          {currentUser && (
            <div className="bg-white/50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                    #{currentUser.rank}
                  </div>
                  <span className="font-medium">Your Position</span>
                </div>
                <span className="font-bold">{currentUser.score} sales</span>
              </div>
            </div>
          )}

          {/* Leaderboard Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Top 3 Leaders
            </div>
            {competition.participants.slice(0, 3).map((participant, index) => (
              <div key={participant.technicianId} className="flex items-center justify-between p-2 bg-white/30 rounded">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    'bg-orange-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm">{participant.name}</span>
                </div>
                <span className="text-sm font-medium">{participant.score}</span>
              </div>
            ))}
          </div>

          {/* Prizes */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-yellow-50 p-2 rounded">
              <div className="font-medium">🥇 1st</div>
              <div className="text-muted-foreground">{competition.prize.first}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium">🥈 2nd</div>
              <div className="text-muted-foreground">{competition.prize.second}</div>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <div className="font-medium">🥉 3rd</div>
              <div className="text-muted-foreground">{competition.prize.third}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
