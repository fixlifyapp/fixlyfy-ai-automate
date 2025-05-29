
import { Badge } from "@/components/ui/badge";
import { Crown, Users, TrendingUp } from "lucide-react";

interface ClientSegmentBadgeProps {
  stats: {
    totalRevenue: number;
    totalJobs: number;
    lastServiceDate?: string;
  };
}

export const ClientSegmentBadge = ({ stats }: ClientSegmentBadgeProps) => {
  const getClientSegment = () => {
    const { totalRevenue, totalJobs, lastServiceDate } = stats;
    
    // Check if client is recent (within last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const isRecent = lastServiceDate && new Date(lastServiceDate) > sixMonthsAgo;

    // VIP clients: High revenue or many jobs
    if (totalRevenue >= 5000 || totalJobs >= 10) {
      return {
        label: "VIP Client",
        variant: "default" as const,
        icon: Crown,
        color: "bg-amber-100 text-amber-800 border-amber-300"
      };
    }

    // Regular clients: Moderate activity
    if (totalRevenue >= 1000 || totalJobs >= 3) {
      return {
        label: "Regular Client",
        variant: "secondary" as const,
        icon: Users,
        color: "bg-blue-100 text-blue-800 border-blue-300"
      };
    }

    // New/Potential clients: Low activity but recent
    if (isRecent) {
      return {
        label: "New Client",
        variant: "outline" as const,
        icon: TrendingUp,
        color: "bg-green-100 text-green-800 border-green-300"
      };
    }

    // For clients with no activity or very old activity, don't show a badge
    return null;
  };

  const segment = getClientSegment();
  
  // Don't render anything if no segment applies
  if (!segment) {
    return null;
  }

  const Icon = segment.icon;

  return (
    <Badge variant={segment.variant} className={`flex items-center gap-1 ${segment.color}`}>
      <Icon className="h-3 w-3" />
      {segment.label}
    </Badge>
  );
};
