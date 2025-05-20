import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface ScheduleCalendarProps {
  view: 'day' | 'week' | 'month';
}

interface JobScheduleItem {
  id: string;
  client: string;
  title: string;
  date: Date;
  duration: number;
  technician: {
    name: string;
    initials: string;
    avatar?: string;
  };
  status: string;
  address: string;
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledJobs, setScheduledJobs] = useState<JobScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Fetch jobs from Supabase
  useEffect(() => {
    if (!user) return;
    
    async function fetchJobs() {
      try {
        setLoading(true);
        
        // For demo, I'm not filtering by date range yet, but you would do that in a real app
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            client:client_id(name),
            technician:technician_id(id, name)
          `)
          .in('status', ['scheduled', 'in-progress', 'completed']);
          
        if (error) throw error;
        
        // Transform data to match component expectations
        const formattedJobs = data.map(job => ({
          id: job.id,
          client: job.client?.name || 'No client',
          title: job.title || 'Unnamed job',
          date: new Date(job.date || new Date()),
          duration: 120, // Default to 2 hours if not specified
          technician: {
            name: job.technician?.name || 'Unassigned',
            initials: job.technician?.name ? 
              job.technician.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 
              'UA'
          },
          status: job.status || 'scheduled',
          address: job.description || 'No address provided'
        }));
        
        setScheduledJobs(formattedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load scheduled jobs');
        // Fallback to demo data if needed
        setScheduledJobs([
          {
            id: "JOB-1001",
            client: "Michael Johnson",
            title: "HVAC Repair",
            date: new Date(2025, 4, 15, 13, 30),
            duration: 120,
            technician: {
              name: "Robert Smith",
              initials: "RS"
            },
            status: "scheduled",
            address: "123 Main St, Apt 45",
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, [user]);
  
  const handlePrevious = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    } else if (view === 'week') {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };
  
  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
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
  
  // Calendar header with navigation controls
  const CalendarHeader = () => (
    <div className="flex items-center justify-between mb-4 border-b border-fixlyfy-border pb-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePrevious}>
          <ChevronLeft size={16} />
        </Button>
        <Button variant="outline" onClick={handleToday}>
          Today
        </Button>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight size={16} />
        </Button>
      </div>
      
      <h2 className="text-lg font-medium">
        {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
        {view === 'week' && `Week of ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`}
        {view === 'month' && format(currentDate, 'MMMM yyyy')}
      </h2>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-fixlyfy"></span>
          <span className="text-xs">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-fixlyfy-warning"></span>
          <span className="text-xs">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-fixlyfy-success"></span>
          <span className="text-xs">Completed</span>
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="fixlyfy-card p-8 flex items-center justify-center">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-fixlyfy rounded-full" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <span className="ml-2">Loading schedule...</span>
      </div>
    );
  }
  
  if (view === 'day') {
    return (
      <div className="fixlyfy-card overflow-hidden">
        <div className="p-4 border-b border-fixlyfy-border">
          <CalendarHeader />
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
                          {job.technician.name}
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
        <div className="p-4 border-b border-fixlyfy-border">
          <CalendarHeader />
        </div>
        
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
                        <div className="mt-1 opacity-90">{job.technician.name}</div>
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
  
  // Month view with basic calendar grid
  return (
    <div className="fixlyfy-card overflow-hidden">
      <div className="p-4 border-b border-fixlyfy-border">
        <CalendarHeader />
      </div>
      
      <div className="grid grid-cols-7 gap-0">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="p-2 text-center border-b border-r border-fixlyfy-border text-xs font-medium">
            {day}
          </div>
        ))}
        
        {Array.from({ length: 35 }, (_, i) => {
          // This is a simplified month view - in a real app you would calculate the actual days
          const dayNum = (i % 30) + 1;
          const hasJob = scheduledJobs.some(job => {
            // Check if any job date matches this calendar day
            return job.date.getDate() === dayNum && job.date.getMonth() === currentDate.getMonth();
          });
          
          return (
            <div 
              key={i} 
              className={cn(
                "h-24 p-1 border-r border-b border-fixlyfy-border",
                hasJob ? "bg-fixlyfy-bg-interface/30" : ""
              )}
            >
              <div className="text-xs font-medium mb-1">{dayNum}</div>
              {hasJob && (
                <div className="text-xs p-1 rounded bg-fixlyfy text-white mb-1">
                  Job scheduled
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
