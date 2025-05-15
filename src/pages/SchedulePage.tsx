
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleFilters } from "@/components/schedule/ScheduleFilters";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { JobsCreateModal } from "@/components/jobs/JobsCreateModal";

const SchedulePage = () => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-fixlyfy-text-secondary">
            Manage your team's schedule and appointments.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-fixlyfy hover:bg-fixlyfy/90">
          <Plus size={18} className="mr-2" /> New Job
        </Button>
      </div>
      
      <div className="fixlyfy-card p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <ScheduleFilters />
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
      
      <ScheduleCalendar view={view} />
      
      <JobsCreateModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </PageLayout>
  );
};

export default SchedulePage;
