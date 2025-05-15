
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { ReportsFilters } from "@/components/reports/ReportsFilters";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { ReportsTechnicians } from "@/components/reports/ReportsTechnicians";
import { ReportsJobs } from "@/components/reports/ReportsJobs";

const ReportsPage = () => {
  const [period, setPeriod] = useState('month');
  
  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-fixlyfy-text-secondary">
            Analyze your business performance with detailed reports and insights.
          </p>
        </div>
      </div>
      
      <div className="fixlyfy-card p-4 mb-6">
        <ReportsFilters period={period} setPeriod={setPeriod} />
      </div>
      
      <ReportsOverview period={period} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <ReportsCharts period={period} />
        </div>
        <div>
          <ReportsTechnicians period={period} />
        </div>
      </div>
      
      <div className="mt-6">
        <ReportsJobs period={period} />
      </div>
    </PageLayout>
  );
};

export default ReportsPage;
