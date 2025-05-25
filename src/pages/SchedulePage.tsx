
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { TechnicianSidebar } from "@/components/schedule/TechnicianSidebar";
import { AIInsightsPanel } from "@/components/schedule/AIInsightsPanel";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, Users, Brain } from "lucide-react";

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');
  const [showTechnicianSidebar, setShowTechnicianSidebar] = useState(true);

  return (
    <PageLayout>
      <PageHeader
        title="Schedule Management"
        subtitle="Optimize job scheduling with AI-powered insights"
        icon={Calendar}
        badges={[
          { text: "Smart Scheduling", icon: Brain, variant: "fixlyfy" },
          { text: "Real-time Updates", icon: Clock, variant: "success" },
          { text: "Team Coordination", icon: Users, variant: "info" }
        ]}
        actionButton={{
          text: "New Appointment",
          icon: Plus,
          onClick: () => {}
        }}
      />

      {/* Filters and Controls */}
      <div className="mb-6 space-y-4">
        <ScheduleFilters 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          view={view}
          onViewChange={setView}
        />
        
        <AIInsightsPanel />
      </div>

      {/* Main Schedule Interface */}
      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1">
          <ScheduleCalendar 
            selectedDate={selectedDate}
            view={view}
          />
        </div>
        
        {/* Technician Sidebar */}
        {showTechnicianSidebar && (
          <div className="w-80">
            <TechnicianSidebar />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SchedulePage;
