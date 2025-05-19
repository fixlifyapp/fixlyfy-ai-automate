
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, ChevronLeft } from "lucide-react";
import { TechnicianSidebar } from "@/components/schedule/TechnicianSidebar";
import { AIInsightsPanel } from "@/components/schedule/AIInsightsPanel";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";

const SchedulePage = () => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  
  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-fixlyfy-text-secondary">
            Manage your team's schedule and appointments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAIInsights(!showAIInsights)}
            className="gap-2"
          >
            <Calendar size={18} /> AI Insights
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-fixlyfy hover:bg-fixlyfy/90">
            <Plus size={18} className="mr-2" /> New Job
          </Button>
        </div>
      </div>
      
      <div className="fixlyfy-card p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <ScheduleFilters view={view} onViewChange={setView} />
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-fixlyfy-border">
              <Button
                variant={view === 'day' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView('day')}
                className="rounded-r-none border-r border-fixlyfy-border"
              >
                Day
              </Button>
              <Button
                variant={view === 'week' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView('week')}
                className="rounded-none border-r border-fixlyfy-border"
              >
                Week
              </Button>
              <Button
                variant={view === 'month' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView('month')}
                className="rounded-l-none"
              >
                Month
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_350px] gap-6">
        <TechnicianSidebar />
        <ScheduleCalendar view={view} />
        {showAIInsights && <AIInsightsPanel />}
      </div>
      
      <ScheduleJobModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </PageLayout>
  );
};

export default SchedulePage;
