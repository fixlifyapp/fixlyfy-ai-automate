
import { PageLayout } from "@/components/layout/PageLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { AiInsights } from "@/components/dashboard/AiInsights";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { UpcomingJobs } from "@/components/dashboard/UpcomingJobs";
import { AiAssistant } from "@/components/dashboard/AiAssistant";

const Index = () => {
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-fixlyfy-text-secondary">
          Welcome back! Here's an overview of your business.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <DashboardMetrics />
        </div>
        <div>
          <AiInsights />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>
        <div>
          <AiAssistant />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-6">
            <UpcomingJobs />
            <ActivityFeed />
          </div>
        </div>
        <div>
          <RecentJobs />
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
