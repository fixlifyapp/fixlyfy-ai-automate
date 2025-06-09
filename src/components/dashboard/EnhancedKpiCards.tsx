
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Wrench } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const EnhancedKpiCards = () => {
  const { user } = useAuth();

  // Mock data since payment system is being rebuilt
  const mockData = {
    totalRevenue: 45780,
    revenueChange: 12.5,
    totalJobs: 156,
    jobsChange: 8.2,
    activeClients: 89,
    clientsChange: 15.3,
    completedJobs: 142,
    completedChange: 6.7
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${mockData.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            +{mockData.revenueChange}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mockData.totalJobs}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            +{mockData.jobsChange}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mockData.activeClients}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            +{mockData.clientsChange}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mockData.completedJobs}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            +{mockData.completedChange}% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
