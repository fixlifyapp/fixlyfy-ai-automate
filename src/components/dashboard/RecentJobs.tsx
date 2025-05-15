
import { CalendarClock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const recentJobs = [
  {
    id: 'JOB-1001',
    client: 'Michael Johnson',
    address: '123 Main St, Apt 45',
    service: 'HVAC Repair',
    status: 'scheduled',
    time: '1:30 PM Today',
    tech: {
      name: 'Robert Smith',
      avatar: 'https://i.pravatar.cc/150?img=1'
    }
  },
  {
    id: 'JOB-1002',
    client: 'Sarah Williams',
    address: '456 Oak Ave',
    service: 'Plumbing',
    status: 'in-progress',
    time: '2:45 PM Today',
    tech: {
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=2'
    }
  },
  {
    id: 'JOB-1003',
    client: 'David Brown',
    address: '789 Pine St',
    service: 'Electrical',
    status: 'completed',
    time: '11:15 AM Today',
    tech: {
      name: 'Emily Clark',
      avatar: 'https://i.pravatar.cc/150?img=5'
    }
  },
  {
    id: 'JOB-1004',
    client: 'Jessica Miller',
    address: '321 Elm St',
    service: 'HVAC Maintenance',
    status: 'scheduled',
    time: 'Tomorrow, 9:00 AM',
    tech: {
      name: 'Robert Smith',
      avatar: 'https://i.pravatar.cc/150?img=1'
    }
  },
];

export const RecentJobs = () => {
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
        {recentJobs.map((job, idx) => (
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
              <Button variant="outline" size="sm" className="text-fixlyfy border-fixlyfy/20">
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-6 pb-6">
        <Button variant="ghost" size="sm" className="w-full text-fixlyfy">
          View All Jobs
        </Button>
      </div>
    </div>
  );
};
