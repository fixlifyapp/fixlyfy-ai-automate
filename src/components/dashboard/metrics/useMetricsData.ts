
import { useState, useEffect } from 'react';

interface MetricsData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalJobs: number;
  completedJobs: number;
  averageJobValue: number;
  clientCount: number;
  revenueGrowth: number;
  jobGrowth: number;
  revenueByMonth: Array<{ month: string; revenue: number; }>;
  jobsByStatus: Array<{ status: string; count: number; }>;
  topClients: Array<{ name: string; revenue: number; }>;
}

export const useMetricsData = () => {
  const [data, setData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data since payment system is being rebuilt
    const mockData: MetricsData = {
      totalRevenue: 45780,
      monthlyRevenue: 25430,
      totalJobs: 156,
      completedJobs: 142,
      averageJobValue: 293.46,
      clientCount: 89,
      revenueGrowth: 12.5,
      jobGrowth: 8.2,
      revenueByMonth: [
        { month: 'Jan', revenue: 18500 },
        { month: 'Feb', revenue: 22300 },
        { month: 'Mar', revenue: 25430 },
      ],
      jobsByStatus: [
        { status: 'completed', count: 142 },
        { status: 'in_progress', count: 8 },
        { status: 'scheduled', count: 6 },
      ],
      topClients: [
        { name: 'ABC Corp', revenue: 5600 },
        { name: 'XYZ Industries', revenue: 4200 },
        { name: 'Tech Solutions', revenue: 3800 },
      ]
    };

    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  return { data, isLoading };
};
