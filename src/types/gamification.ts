
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'warranty_sales' | 'conversion_rate' | 'revenue' | 'customer_satisfaction';
  requirement: number;
  reward: {
    points: number;
    badge: string;
    bonus?: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress: number;
}

export interface Competition {
  id: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly' | 'seasonal';
  category: 'sales' | 'conversion' | 'revenue' | 'team';
  startDate: string;
  endDate: string;
  prize: {
    first: string;
    second: string;
    third: string;
  };
  participants: Participant[];
  status: 'upcoming' | 'active' | 'completed';
}

export interface Participant {
  technicianId: string;
  name: string;
  score: number;
  rank: number;
  avatar?: string;
}

export interface TechnicianStats {
  id: string;
  name: string;
  level: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  warrantySales: number;
  conversionRate: number;
  totalRevenue: number;
  customerSatisfaction: number;
  achievements: Achievement[];
  currentGoals: Goal[];
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
  reward: number;
  type: 'daily' | 'weekly' | 'monthly';
}

export interface Reward {
  id: string;
  name: string;
  type: 'commission' | 'bonus' | 'recognition' | 'prize';
  value: number;
  description: string;
  requirement: string;
  isEarned: boolean;
  earnedAt?: string;
}
