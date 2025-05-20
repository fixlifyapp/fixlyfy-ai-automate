
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface UpcomingJob {
  id: string;
  title: string;
  client: string;
  avatar: string;
  address: string;
  date: string;
  time: string;
  status: string;
  priority: "low" | "medium" | "high";
}

export const UpcomingJobs = () => {
  const [upcomingJobs, setUpcomingJobs] = useState<UpcomingJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingJobs = async () => {
      try {
        setIsLoading(true);
        
        // Get upcoming jobs (scheduled jobs)
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('id, title, client_id, service, address, status, date, schedule_start, schedule_end, priority')
          .in('status', ['scheduled', 'in-progress'])
          .order('schedule_start', { ascending: true })
          .limit(4);
        
        if (error) throw error;
        
        // If no jobs found
        if (!jobs || jobs.length === 0) {
          setUpcomingJobs([]);
          setIsLoading(false);
          return;
        }
        
        // Get client data for all jobs
        const clientIds = jobs
          .map(job => job.client_id)
          .filter(id => id !== null) as string[];
        
        const { data: clients } = await supabase
          .from('clients')
          .select('id, name, address')
          .in('id', clientIds);
        
        // Create map of client ids to names
        const clientMap = new Map();
        if (clients) {
          clients.forEach(client => {
            clientMap.set(client.id, {
              name: client.name,
              address: client.address
            });
          });
        }
        
        // Format the jobs data
        const formattedJobs = jobs.map(job => {
          const clientInfo = job.client_id ? clientMap.get(job.client_id) : null;
          const clientName = clientInfo ? clientInfo.name : 'Unknown Client';
          const address = job.address || (clientInfo ? clientInfo.address : 'No address');
          
          // Format date and time
          const scheduleDate = job.schedule_start ? new Date(job.schedule_start) : new Date();
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          
          let dateDisplay;
          if (scheduleDate.toDateString() === today.toDateString()) {
            dateDisplay = 'Today';
          } else if (scheduleDate.toDateString() === tomorrow.toDateString()) {
            dateDisplay = 'Tomorrow';
          } else {
            dateDisplay = scheduleDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }
          
          const timeDisplay = scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          // Create avatar placeholder from client name
          const avatarPlaceholder = clientName.charAt(0).toUpperCase();
          
          return {
            id: job.id,
            title: job.service || job.title || 'Service Call',
            client: clientName,
            avatar: '', // No real avatars in the database, will use fallback
            address: address || 'No address provided',
            date: dateDisplay,
            time: timeDisplay,
            status: job.status,
            priority: job.priority || 'medium' as 'low' | 'medium' | 'high'
          };
        });
        
        setUpcomingJobs(formattedJobs);
      } catch (error) {
        console.error('Error fetching upcoming jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUpcomingJobs();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Upcoming Jobs</CardTitle>
          <CardDescription>Jobs scheduled for today and tomorrow</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          asChild
        >
          <Link to="/schedule">View Schedule</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 size={24} className="animate-spin text-fixlyfy" />
            <span className="ml-2">Loading jobs...</span>
          </div>
        ) : upcomingJobs.length === 0 ? (
          <div className="text-center py-8 text-fixlyfy-text-secondary">
            <p>No upcoming jobs found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingJobs.map((job) => (
              <div key={job.id} className="flex items-start gap-4 p-3 rounded-lg border border-fixlyfy-border hover:bg-fixlyfy-bg-interface/50 transition-colors">
                <Avatar className="h-10 w-10 mt-1">
                  <AvatarImage src={job.avatar} alt={job.client} />
                  <AvatarFallback>{job.client.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium leading-none">{job.title}</h4>
                      <p className="text-sm text-fixlyfy-text-secondary">{job.client}</p>
                    </div>
                    <Badge className={cn(
                      job.priority === "high" && "bg-fixlyfy-error/10 text-fixlyfy-error",
                      job.priority === "medium" && "bg-fixlyfy-warning/10 text-fixlyfy-warning",
                      job.priority === "low" && "bg-fixlyfy-success/10 text-fixlyfy-success"
                    )}>
                      {job.priority} priority
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <div className="flex items-center text-fixlyfy-text-secondary text-xs">
                      <Calendar size={14} className="mr-1" />
                      {job.date}
                    </div>
                    <div className="flex items-center text-fixlyfy-text-secondary text-xs">
                      <Clock size={14} className="mr-1" />
                      {job.time}
                    </div>
                    <div className="flex items-center text-fixlyfy-text-secondary text-xs">
                      <MapPin size={14} className="mr-1" />
                      {job.address}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
