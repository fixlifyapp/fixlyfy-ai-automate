
import React from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ClientStatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'positive' | 'negative';
  };
  icon?: React.ComponentType<any>;
}

export const ClientStatsCard = ({ title, value, change, icon: Icon }: ClientStatsCardProps) => {
  return (
    <ModernCard>
      <ModernCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </ModernCardHeader>
      <ModernCardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {change.type === 'positive' ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={change.type === 'positive' ? 'text-green-500' : 'text-red-500'}>
              {change.value}
            </span>
            <span>from last month</span>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
