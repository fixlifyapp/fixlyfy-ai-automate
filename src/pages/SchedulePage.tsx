
import { PageLayout } from "@/components/layout/PageLayout";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const SchedulePage = () => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Schedule</h1>
          <div className="flex gap-2">
            <Button 
              variant={view === 'day' ? 'default' : 'outline'}
              onClick={() => setView('day')}
              size="sm"
            >
              Day
            </Button>
            <Button 
              variant={view === 'week' ? 'default' : 'outline'}
              onClick={() => setView('week')}
              size="sm"
            >
              Week
            </Button>
            <Button 
              variant={view === 'month' ? 'default' : 'outline'}
              onClick={() => setView('month')}
              size="sm"
            >
              Month
            </Button>
          </div>
        </div>
        <ScheduleCalendar view={view} currentDate={currentDate} />
      </div>
    </PageLayout>
  );
};

export default SchedulePage;
