
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { useState } from "react";

interface ScheduleCalendarProps {
  view: 'day' | 'week' | 'month';
}

// This is sample job data for the schedule
const scheduledJobs = [
  {
    id: "JOB-1001",
    client: "Michael Johnson",
    title: "HVAC Repair",
    date: new Date(2025, 4, 15, 13, 30),
    duration: 120, // in minutes
    technician: "Robert Smith",
    status: "scheduled",
    address: "123 Main St, Apt 45",
  },
  {
    id: "JOB-1002",
    client: "Sarah Williams",
    title: "Plumbing",
    date: new Date(2025, 4, 15, 14, 45),
    duration: 90,
    technician: "John Doe",
    status: "in-progress",
    address: "456 Oak Ave",
  },
  {
    id: "JOB-1003",
    client: "David Brown",
    title: "Electrical",
    date: new Date(2025, 4, 15, 11, 15),
    duration: 60,
    technician: "Emily Clark",
    status: "completed",
    address: "789 Pine St",
  },
  {
    id: "JOB-1004",
    client: "Jessica Miller",
    title: "HVAC Maintenance",
    date: new Date(2025, 4, 16, 9, 0),
    duration: 180,
    technician: "Robert Smith",
    status: "scheduled",
    address: "321 Elm St",
  },
  {
    id: "JOB-1005",
    client: "Thomas Anderson",
    title: "Electrical Inspection",
    date: new Date(2025, 4, 17, 15, 30),
    duration: 120,
    technician: "Emily Clark",
    status: "scheduled",
    address: "555 Maple Rd",
  },
];

const timeSlots = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 8; // Start at 8 AM
  return `${hour === 12 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
});

export const ScheduleCalendar = ({ view }: ScheduleCalendarProps) => {
  const [currentDate] = useState(new Date(2025, 4, 15)); // Fixed to May 15, 2025
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const getJobsForTimeSlot = (time: string, day: Date) => {
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr);
    const isPM = time.includes('PM');
    
    if (isPM && hour !== 12) {
      hour += 12;
    } else if (!isPM && hour === 12) {
      hour = 0;
    }
    
    return scheduledJobs.filter(job => {
      const jobDate = job.date;
      return isSameDay(jobDate, day) && 
             jobDate.getHours() >= hour && 
             jobDate.getHours() < hour + 1;
    });
  };
  
  if (view === 'day') {
    return (
      <div className="fixlyfy-card overflow-hidden">
        <div className="p-4 border-b border-fixlyfy-border">
          <h2 className="text-lg font-medium">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
        </div>
        <div className="overflow-auto">
          {timeSlots.map((time, index) => {
            const jobsInSlot = getJobsForTimeSlot(time, currentDate);
            
            return (
              <div 
                key={time} 
                className={cn(
                  "grid grid-cols-[100px_1fr] border-b border-fixlyfy-border min-h-[100px]",
                  index % 2 === 0 ? "bg-white" : "bg-fixlyfy-bg-interface/30"
                )}
              >
                <div className="p-3 border-r border-fixlyfy-border flex items-start">
                  <span className="text-fixlyfy-text-secondary">{time}</span>
                </div>
                <div className="p-2">
                  {jobsInSlot.map(job => (
                    <div 
                      key={job.id}
                      className={cn(
                        "p-2 rounded mb-2 text-white shadow-sm",
                        job.status === 'scheduled' && "bg-fixlyfy",
                        job.status === 'in-progress' && "bg-fixlyfy-warning",
                        job.status === 'completed' && "bg-fixlyfy-success"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{job.title} - {job.client}</div>
                          <div className="text-xs opacity-90">
                            {format(job.date, 'h:mm a')} - {format(new Date(job.date.getTime() + job.duration * 60000), 'h:mm a')}
                          </div>
                          <div className="text-xs opacity-90 mt-1">{job.address}</div>
                        </div>
                        <Badge className={cn(
                          "bg-white/20",
                          job.status === 'scheduled' && "text-white",
                          job.status === 'in-progress' && "text-white",
                          job.status === 'completed' && "text-white"
                        )}>
                          {job.technician}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  if (view === 'week') {
    return (
      <div className="fixlyfy-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-fixlyfy-border sticky top-0 bg-white z-10">
          {weekDays.map(day => (
            <div 
              key={day.toString()} 
              className="p-4 text-center border-r border-fixlyfy-border last:border-r-0"
            >
              <div className="text-xs text-fixlyfy-text-secondary">{format(day, 'EEEE')}</div>
              <div className={cn(
                "text-lg font-medium mt-1",
                isSameDay(day, currentDate) && "text-fixlyfy"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-auto">
          {timeSlots.map((time, timeIndex) => (
            <div 
              key={time}
              className={cn(
                "grid grid-cols-7 border-b border-fixlyfy-border min-h-[100px]",
                timeIndex % 2 === 0 ? "bg-white" : "bg-fixlyfy-bg-interface/30"
              )}
            >
              {weekDays.map((day, dayIndex) => {
                const jobsInSlot = getJobsForTimeSlot(time, day);
                
                return (
                  <div 
                    key={day.toString()} 
                    className={cn(
                      "p-2 border-r border-fixlyfy-border last:border-r-0 relative",
                      dayIndex === 0 && "pl-[100px]"
                    )}
                  >
                    {dayIndex === 0 && (
                      <div className="absolute left-0 top-3 w-[90px] text-center text-fixlyfy-text-secondary">
                        {time}
                      </div>
                    )}
                    {jobsInSlot.map(job => (
                      <div 
                        key={job.id}
                        className={cn(
                          "p-2 rounded mb-2 text-white shadow-sm text-xs",
                          job.status === 'scheduled' && "bg-fixlyfy",
                          job.status === 'in-progress' && "bg-fixlyfy-warning",
                          job.status === 'completed' && "bg-fixlyfy-success"
                        )}
                      >
                        <div className="font-medium">{job.title} - {job.client}</div>
                        <div className="opacity-90">
                          {format(job.date, 'h:mm a')}
                        </div>
                        <div className="mt-1 opacity-90">{job.technician}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Month view placeholder - would typically be more complex
  return (
    <div className="fixlyfy-card p-6">
      <div className="text-center p-10">
        <h3 className="text-xl font-medium mb-4">Month View</h3>
        <p className="text-fixlyfy-text-secondary">
          Month view would display a traditional calendar with job indicators.
        </p>
        <p className="text-fixlyfy-text-secondary mt-2">
          Each day would show a count of scheduled jobs and color indicators for job types.
        </p>
      </div>
    </div>
  );
};
