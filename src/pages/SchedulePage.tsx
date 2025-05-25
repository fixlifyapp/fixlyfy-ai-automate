
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import { format } from "date-fns";
import { Job } from "@/types/job";
import { useJobs } from "@/hooks/useJobs";
import { JobsCreateModal } from "@/components/jobs/JobsCreateModal";
import { Plus } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const SchedulePage = () => {
  const [selectedView, setSelectedView] = useState<View>("month");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { jobs, isLoading } = useJobs();

  const events = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    start: new Date(job.schedule_start || job.date || ""),
    end: new Date(job.schedule_end || job.date || ""),
    allDay: false,
    resource: job,
  }));

  const handleSelectSlot = (slotInfo: any) => {
    console.log("Selected slot:", slotInfo);
  };

  const handleSelectEvent = (event: any) => {
    console.log("Selected event:", event);
  };

  const eventStyleGetter = (event: any, start: Date, end: Date, isSelected: boolean) => {
    const job = event.resource as Job;
    let backgroundColor = '#3182CE'; // Default color

    switch (job.status) {
      case 'scheduled':
        backgroundColor = '#3182CE';
        break;
      case 'in progress':
        backgroundColor = '#DD6B20';
        break;
      case 'completed':
        backgroundColor = '#38A169';
        break;
      case 'cancelled':
        backgroundColor = '#E53E3E';
        break;
      default:
        backgroundColor = '#718096';
    }

    return {
      style: {
        backgroundColor: backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        textAlign: 'left' as const,
        padding: '2px 5px',
        overflow: 'hidden',
        whiteSpace: 'nowrap' as const,
        textOverflow: 'ellipsis'
      }
    };
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Schedule</CardTitle>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedView("month")}>Month</Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedView("week")}>Week</Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedView("day")}>Day</Button>
              <Button onClick={() => setIsCreateModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Job</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {isLoading ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              Loading...
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 700 }}
              selectable={true}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              view={selectedView}
              onView={(newView) => setSelectedView(newView as View)}
            />
          )}
        </CardContent>
      </Card>

      <JobsCreateModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
};

export default SchedulePage;
