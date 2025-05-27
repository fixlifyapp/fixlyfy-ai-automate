
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, Brain, Crown, Template } from "lucide-react";
import { ReportTemplates } from "@/components/reports/ReportTemplates";
import { CustomReportBuilder } from "@/components/reports/CustomReportBuilder";
import { BusinessIntelligenceAnalytics } from "@/components/reports/BusinessIntelligenceAnalytics";
import { ExecutiveDashboard } from "@/components/reports/ExecutiveDashboard";

const AdvancedReportsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Advanced Reports & Analytics"
        subtitle="Comprehensive reporting, business intelligence, and predictive analytics"
        icon={BarChart3}
        badges={[
          { text: "Templates", icon: Template, variant: "fixlyfy" },
          { text: "AI Insights", icon: Brain, variant: "success" },
          { text: "Executive", icon: Crown, variant: "info" }
        ]}
      />

      <div className="space-y-6">
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
            <TabsTrigger value="builder">Custom Builder</TabsTrigger>
            <TabsTrigger value="analytics">Business Intelligence</TabsTrigger>
            <TabsTrigger value="executive">Executive Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="space-y-6">
            <ReportTemplates />
          </TabsContent>
          
          <TabsContent value="builder" className="space-y-6">
            <CustomReportBuilder />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <BusinessIntelligenceAnalytics />
          </TabsContent>
          
          <TabsContent value="executive" className="space-y-6">
            <ExecutiveDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AdvancedReportsPage;
