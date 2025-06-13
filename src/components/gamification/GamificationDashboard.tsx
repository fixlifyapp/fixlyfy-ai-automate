
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Target, 
  Zap, 
  Star, 
  Medal, 
  TrendingUp,
  Gift,
  Users,
  Calendar
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { AchievementCard } from "./AchievementCard";
import { CompetitionCard } from "./CompetitionCard";
import { GoalProgress } from "./GoalProgress";
import { RewardsList } from "./RewardsList";

export const GamificationDashboard = () => {
  const { stats, achievements, competitions, rewards, isLoading } = useGamification();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const pendingAchievements = achievements.filter(a => !a.unlockedAt);

  return (
    <div className="space-y-6">
      {/* Header with Level and Points */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-primary to-purple-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">Level {stats.level}</div>
            <div className="text-sm opacity-90">{stats.totalPoints} points</div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {stats.name}!</h2>
            <p className="text-muted-foreground">
              Current streak: {stats.currentStreak} days • Best: {stats.longestStreak} days
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1">
            <Medal className="h-3 w-3" />
            {unlockedAchievements.length} Achievements
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Trophy className="h-3 w-3" />
            Rank #3
          </Badge>
        </div>
      </div>

      {/* Current Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Current Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.currentGoals.map((goal) => (
            <GoalProgress key={goal.id} goal={goal} />
          ))}
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warranties Sold</p>
                <p className="text-2xl font-bold">{stats.warrantySales}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-600 mt-2">2 more for next milestone</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">7.5% to Champion level</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Generated</p>
                <p className="text-2xl font-bold">${stats.totalRevenue}</p>
              </div>
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-600 mt-2">$1,200 to next reward</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Happy Customers</p>
                <p className="text-2xl font-bold">{stats.customerSatisfaction}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-xs text-yellow-600 mt-2">8 more for Hero badge</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Unlocked Achievements ({unlockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unlockedAchievements.length > 0 ? (
              unlockedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} isUnlocked={true} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No achievements unlocked yet. Keep selling to earn your first badge!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Next Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingAchievements.slice(0, 3).map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} isUnlocked={false} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Active Competitions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Competitions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {competitions.filter(c => c.status === 'active').map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </CardContent>
      </Card>

      {/* Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Rewards & Bonuses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RewardsList rewards={rewards} />
        </CardContent>
      </Card>
    </div>
  );
};
