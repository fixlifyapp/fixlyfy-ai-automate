
import { useEffect, useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Job {
  id: string;
  client: string;
  address: string;
  service: string;
  status: string;
  time: string;
  tech: {
    name: string;
    avatar: string;
  };
}

export const RecentJobs = () => {
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      setIsLoading(true);
      try {
        // Fetch recent jobs from Supabase
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, service, address, status, schedule_start, client_id, technician_id')
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (jobsError) throw jobsError;
        
        if (!jobsData || jobsData.length === 0) {
          setRecentJobs([]);
          setIsLoading(false);
          return;
        }

        // Get all unique client IDs
        const clientIds = jobsData
          .map(job => job.client_id)
          .filter(id => id !== null) as string[];
          
        // Get all unique technician IDs
        const technicianIds = jobsData
          .map(job => job.technician_id)
          .filter(id => id !== null) as string[];
        
        // Fetch clients data
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, name, address')
          .in('id', clientIds);
          
        // Create a map of client IDs to names
        const clientMap = new Map();
        const clientAddressMap = new Map();
        if (clientsData) {
          clientsData.forEach(client => {
            clientMap.set(client.id, client.name);
            clientAddressMap.set(client.id, client.address);
          });
        }
        
        // Fetch technicians data
        const { data: techniciansData } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', technicianIds);
          
        // Create a map of technician IDs to names
        const techMap = new Map();
        const techAvatarMap = new Map();
        if (techniciansData) {
          techniciansData.forEach(tech => {
            techMap.set(tech.id, tech.name || 'Unnamed Technician');
            techAvatarMap.set(tech.id, tech.avatar_url);
          });
        }

        // Format the job data
        const formattedJobs = jobsData.map(job => {
          const clientName = job.client_id ? clientMap.get(job.client_id) || 'Unknown Client' : 'Unknown Client';
          const address = job.client_id ? clientAddressMap.get(job.client_id) || job.address || 'No address' : job.address || 'No address';
          const techName = job.technician_id ? techMap.get(job.technician_id) || 'Unassigned' : 'Unassigned';
          const techAvatar = job.technician_id ? techAvatarMap.get(job.technician_id) || '' : '';
          
          // Format schedule time
          let timeDisplay = 'Unscheduled';
          if (job.schedule_start) {
            const scheduleDate = new Date(job.schedule_start);
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);
            
            if (scheduleDate.toDateString() === today.toDateString()) {
              timeDisplay = `${scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Today`;
            } else if (scheduleDate.toDateString() === tomorrow.toDateString()) {
              timeDisplay = `${scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Tomorrow`;
            } else {
              timeDisplay = scheduleDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
                scheduleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          }
          
          return {
            id: job.id,
            client: clientName,
            address: address,
            service: job.service || 'General Service',
            status: job.status || 'scheduled',
            time: timeDisplay,
            tech: {
              name: techName,
              avatar: techAvatar
            }
          };
        });
        
        setRecentJobs(formattedJobs);
      } catch (error: any) {
        console.error('Error fetching recent jobs:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentJobs();
  }, []);

  return (
    <div className="fixlyfy-card h-full">
      <div className="p-6 border-b border-fixlyfy-border flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md mr-3 fixlyfy-gradient flex items-center justify-center">
            <CalendarClock size={18} className="text-white" />
          </div>
          <h2 className="text-lg font-medium">Upcoming Jobs</h2>
        </div>
      </div>
      
      <div className="px-6 py-4 space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 size={24} className="animate-spin text-fixlyfy" />
            <span className="ml-2">Loading jobs...</span>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-fixlyfy-text-secondary">
            <p>Unable to load jobs data.</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="text-center py-6 text-fixlyfy-text-secondary">
            <p>No upcoming jobs found.</p>
          </div>
        ) : (
          recentJobs.map((job, idx) => (
            <div 
              key={job.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{job.client}</h3>
                  <p className="text-xs text-fixlyfy-text-secondary">{job.address}</p>
                  <p className="text-xs text-fixlyfy-text-secondary mt-1">{job.service}</p>
                </div>
                <Badge className={cn(
                  job.status === 'scheduled' && "bg-fixlyfy-info/10 text-fixlyfy-info",
                  job.status === 'in-progress' && "bg-fixlyfy-warning/10 text-fixlyfy-warning",
                  job.status === 'completed' && "bg-fixlyfy-success/10 text-fixlyfy-success",
                )}>
                  {job.status === 'scheduled' && 'Scheduled'}
                  {job.status === 'in-progress' && 'In Progress'}
                  {job.status === 'completed' && 'Completed'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={job.tech.avatar} />
                    <AvatarFallback>{job.tech.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-fixlyfy-text-secondary">{job.time}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-fixlyfy border-fixlyfy/20"
                  asChild
                >
                  <Link to={`/jobs/${job.id}`}>View</Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="px-6 pb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-fixlyfy"
          asChild
        >
          <Link to="/jobs">View All Jobs</Link>
        </Button>
      </div>
    </div>
  );
};
