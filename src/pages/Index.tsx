
import { PageLayout } from "@/components/layout/PageLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { AiInsights } from "@/components/dashboard/AiInsights";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { UpcomingJobs } from "@/components/dashboard/UpcomingJobs";
import { AiAssistant } from "@/components/dashboard/AiAssistant";
import { SecondaryMetrics } from "@/components/dashboard/SecondaryMetrics";
import { ServiceCategoryChart } from "@/components/dashboard/ServiceCategoryChart";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new dashboard
    navigate('/dashboard');
  }, [navigate]);
  
  return (
    <PageLayout>
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-fixlyfy-text-secondary">Redirecting to Dashboard...</p>
      </div>
    </PageLayout>
  );
};

export default Index;
