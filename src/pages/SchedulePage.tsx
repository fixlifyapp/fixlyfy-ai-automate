
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { AIInsightsPanel } from "@/components/schedule/AIInsightsPanel";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { useSearchParams } from "react-router-dom";

const SchedulePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'day' | 'week' | 'month'>(
    (searchParams.get('view') as 'day' | 'week' | 'month') || 'week'
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  
  // Update URL when view changes
  const handleViewChange = (newView: 'day' | 'week' | 'month') => {
    setView(newView);
    setSearchParams(params => {
      params.set('view', newView);
      return params;
    });
  };
  
  // Handle date change from filters
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };
  
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
      
      {/* Place filters directly above calendar in the main content area */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-4">
          <div className="fixlyfy-card p-4">
            <ScheduleFilters 
              view={view} 
              onViewChange={handleViewChange} 
              currentDate={currentDate}
              onDateChange={handleDateChange}
            />
          </div>
          <ScheduleCalendar view={view} currentDate={currentDate} />
        </div>
        {showAIInsights && <AIInsightsPanel />}
      </div>
      
      <ScheduleJobModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </PageLayout>
  );
};

export default SchedulePage;
