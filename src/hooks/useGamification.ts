
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Achievement, Competition, TechnicianStats, Goal, Reward } from '@/types/gamification';

export const useGamification = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define available achievements
  const availableAchievements: Achievement[] = [
    {
      id: 'warranty-warrior',
      name: 'Warranty Warrior',
      description: 'Sell 10 warranties',
      icon: '🛡️',
      type: 'warranty_sales',
      requirement: 10,
      reward: { points: 100, badge: 'Warrior', bonus: 50 },
      rarity: 'common',
      progress: 0
    },
    {
      id: 'conversion-champion',
      name: 'Conversion Champion',
      description: 'Achieve 80%+ conversion rate',
      icon: '🏆',
      type: 'conversion_rate',
      requirement: 80,
      reward: { points: 200, badge: 'Champion', bonus: 100 },
      rarity: 'rare',
      progress: 0
    },
    {
      id: 'revenue-rocket',
      name: 'Revenue Rocket',
      description: 'Generate $5K+ in warranty sales',
      icon: '🚀',
      type: 'revenue',
      requirement: 5000,
      reward: { points: 300, badge: 'Rocket', bonus: 200 },
      rarity: 'epic',
      progress: 0
    },
    {
      id: 'customer-hero',
      name: 'Customer Hero',
      description: 'Achieve 50+ satisfied customers',
      icon: '⭐',
      type: 'customer_satisfaction',
      requirement: 50,
      reward: { points: 250, badge: 'Hero', bonus: 150 },
      rarity: 'legendary',
      progress: 0
    }
  ];

  // Load gamification data
  const loadGamificationData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockStats: TechnicianStats = {
        id: user.id,
        name: user.email?.split('@')[0] || 'Technician',
        level: 5,
        totalPoints: 1250,
        currentStreak: 7,
        longestStreak: 14,
        warrantySales: 8,
        conversionRate: 72.5,
        totalRevenue: 3800,
        customerSatisfaction: 42,
        achievements: [],
        currentGoals: [
          {
            id: 'daily-goal',
            name: 'Daily Sales Goal',
            description: 'Sell 2 warranties today',
            target: 2,
            current: 1,
            deadline: new Date().toISOString(),
            reward: 25,
            type: 'daily'
          },
          {
            id: 'weekly-goal',
            name: 'Weekly Revenue Goal',
            description: 'Generate $1K in warranty revenue this week',
            target: 1000,
            current: 650,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            reward: 100,
            type: 'weekly'
          }
        ]
      };

      // Calculate achievement progress
      const updatedAchievements = availableAchievements.map(achievement => {
        let progress = 0;
        let isUnlocked = false;

        switch (achievement.type) {
          case 'warranty_sales':
            progress = (mockStats.warrantySales / achievement.requirement) * 100;
            isUnlocked = mockStats.warrantySales >= achievement.requirement;
            break;
          case 'conversion_rate':
            progress = (mockStats.conversionRate / achievement.requirement) * 100;
            isUnlocked = mockStats.conversionRate >= achievement.requirement;
            break;
          case 'revenue':
            progress = (mockStats.totalRevenue / achievement.requirement) * 100;
            isUnlocked = mockStats.totalRevenue >= achievement.requirement;
            break;
          case 'customer_satisfaction':
            progress = (mockStats.customerSatisfaction / achievement.requirement) * 100;
            isUnlocked = mockStats.customerSatisfaction >= achievement.requirement;
            break;
        }

        return {
          ...achievement,
          progress: Math.min(progress, 100),
          unlockedAt: isUnlocked ? new Date().toISOString() : undefined
        };
      });

      // Mock competitions
      const mockCompetitions: Competition[] = [
        {
          id: 'weekly-sales',
          name: 'Weekly Sales Challenge',
          description: 'Most warranties sold this week',
          type: 'weekly',
          category: 'sales',
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          prize: {
            first: '$500 Bonus',
            second: '$300 Bonus',
            third: '$100 Bonus'
          },
          participants: [
            { technicianId: '1', name: 'Mike Johnson', score: 12, rank: 1 },
            { technicianId: '2', name: 'Sarah Wilson', score: 10, rank: 2 },
            { technicianId: user.id, name: mockStats.name, score: 8, rank: 3 }
          ],
          status: 'active'
        }
      ];

      // Mock rewards
      const mockRewards: Reward[] = [
        {
          id: 'performance-bonus',
          name: 'Performance Bonus',
          type: 'bonus',
          value: 150,
          description: 'Extra bonus for outstanding performance',
          requirement: 'Complete 3 achievements',
          isEarned: true,
          earnedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setStats(mockStats);
      setAchievements(updatedAchievements);
      setCompetitions(mockCompetitions);
      setRewards(mockRewards);

    } catch (error) {
      console.error('Error loading gamification data:', error);
      toast.error('Failed to load gamification data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Track warranty sale for gamification
  const trackWarrantySale = useCallback(async (saleData: {
    amount: number;
    conversionRate: number;
    customerRating: number;
  }) => {
    if (!stats) return;

    // Update stats
    const updatedStats = {
      ...stats,
      warrantySales: stats.warrantySales + 1,
      totalRevenue: stats.totalRevenue + saleData.amount,
      conversionRate: saleData.conversionRate,
      totalPoints: stats.totalPoints + 25 // Base points for sale
    };

    setStats(updatedStats);

    // Check for new achievements
    const newAchievements = achievements.filter(achievement => {
      if (achievement.unlockedAt) return false; // Already unlocked

      let shouldUnlock = false;
      switch (achievement.type) {
        case 'warranty_sales':
          shouldUnlock = updatedStats.warrantySales >= achievement.requirement;
          break;
        case 'revenue':
          shouldUnlock = updatedStats.totalRevenue >= achievement.requirement;
          break;
      }

      if (shouldUnlock) {
        // Show achievement notification with animation
        toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`, {
          description: `You earned ${achievement.reward.points} points and a ${achievement.reward.bonus} bonus!`,
          duration: 5000
        });
        
        return true;
      }
      return false;
    });

    // Update achievements with new unlocks
    if (newAchievements.length > 0) {
      setAchievements(prev => prev.map(achievement => {
        const isNewlyUnlocked = newAchievements.some(na => na.id === achievement.id);
        return isNewlyUnlocked 
          ? { ...achievement, unlockedAt: new Date().toISOString() }
          : achievement;
      }));
    }

  }, [stats, achievements]);

  useEffect(() => {
    loadGamificationData();
  }, [loadGamificationData]);

  return {
    stats,
    achievements,
    competitions,
    rewards,
    isLoading,
    trackWarrantySale,
    refreshData: loadGamificationData
  };
};
