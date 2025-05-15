
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for upcoming jobs
const upcomingJobs = [
  {
    id: "JOB-3001",
    title: "HVAC Installation",
    client: "Michael Johnson",
    avatar: "/avatars/michael.jpg",
    address: "123 Main St, Boston, MA",
    date: "Today",
    time: "2:00 PM",
    status: "scheduled",
    priority: "high"
  },
  {
    id: "JOB-3002",
    title: "Plumbing Repair",
    client: "Sarah Williams",
    avatar: "/avatars/sarah.jpg",
    address: "456 Oak Ave, Boston, MA",
    date: "Today",
    time: "4:30 PM",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: "JOB-3003",
    title: "Electrical Wiring",
    client: "Apex Construction Inc.",
    avatar: "/avatars/james.jpg",
    address: "789 Business Park, Boston, MA",
    date: "Tomorrow",
    time: "10:00 AM",
    status: "scheduled",
    priority: "medium"
  },
  {
    id: "JOB-3004",
    title: "A/C Maintenance",
    client: "Jessica Miller",
    avatar: "/avatars/lisa.jpg",
    address: "321 Elm St, Boston, MA",
    date: "Tomorrow",
    time: "1:15 PM",
    status: "scheduled",
    priority: "low"
  }
];

export const UpcomingJobs = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Upcoming Jobs</CardTitle>
          <CardDescription>Jobs scheduled for today and tomorrow</CardDescription>
        </div>
        <Button variant="outline" size="sm">View Schedule</Button>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
