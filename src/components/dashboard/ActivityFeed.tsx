
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Activity {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  time: string;
  type: string;
}

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setIsLoading(true);
      try {
        // Fetch recent jobs created or completed
        const { data: recentJobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, status, created_at, updated_at, created_by, client_id')
          .or('status.eq.completed,status.eq.in-progress')
          .order('updated_at', { ascending: false })
          .limit(3);

        if (jobsError) throw jobsError;

        // Fetch recent clients added
        const { data: recentClients, error: clientsError } = await supabase
          .from('clients')
          .select('id, name, created_at, created_by')
          .order('created_at', { ascending: false })
          .limit(2);

        if (clientsError) throw clientsError;

        // Fetch recent invoices
        const { data: recentInvoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('id, number, client_id, created_at')
          .order('created_at', { ascending: false })
          .limit(2);

        if (invoicesError) throw invoicesError;

        // Get all user IDs who performed these actions
        const userIds = new Set<string>();
        
        recentJobs.forEach(job => {
          if (job.created_by) userIds.add(job.created_by);
        });
        
        recentClients.forEach(client => {
          if (client.created_by) userIds.add(client.created_by);
        });

        // Fetch client names
        const clientIds = new Set<string>();
        recentJobs.forEach(job => {
          if (job.client_id) clientIds.add(job.client_id);
        });
        recentInvoices.forEach(invoice => {
          if (invoice.client_id) clientIds.add(invoice.client_id);
        });

        // Convert to array
        const userIdsArray = Array.from(userIds);
        const clientIdsArray = Array.from(clientIds);

        // Fetch user profile data
        let usersMap = new Map();
        if (userIdsArray.length > 0) {
          const { data: users } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .in('id', userIdsArray);

          if (users) {
            users.forEach(user => {
              usersMap.set(user.id, {
                name: user.name || 'Unknown User',
                avatar: user.avatar_url
              });
            });
          }
        }

        // Fetch client names
        let clientsMap = new Map();
        if (clientIdsArray.length > 0) {
          const { data: clients } = await supabase
            .from('clients')
            .select('id, name')
            .in('id', clientIdsArray);

          if (clients) {
            clients.forEach(client => {
              clientsMap.set(client.id, client.name);
            });
          }
        }

        // Create activity items
        const activityItems: Activity[] = [];

        // Add job activities
        recentJobs.forEach(job => {
          const user = job.created_by ? usersMap.get(job.created_by) : { name: 'System', avatar: '' };
          const clientName = job.client_id ? clientsMap.get(job.client_id) : 'Unknown Client';
          const jobTitle = job.title || 'Untitled Job';
          
          if (job.status === 'completed') {
            activityItems.push({
              id: `job-completed-${job.id}`,
              user: user || { name: 'System', avatar: '' },
              action: 'completed a job',
              target: `${jobTitle} for ${clientName}`,
              time: formatTimeAgo(new Date(job.updated_at)),
              type: 'job'
            });
          } else {
            activityItems.push({
              id: `job-created-${job.id}`,
              user: user || { name: 'System', avatar: '' },
              action: 'created a new job',
              target: `${jobTitle} for ${clientName}`,
              time: formatTimeAgo(new Date(job.created_at)),
              type: 'job'
            });
          }
        });

        // Add client activities
        recentClients.forEach(client => {
          const user = client.created_by ? usersMap.get(client.created_by) : { name: 'System', avatar: '' };
          
          activityItems.push({
            id: `client-added-${client.id}`,
            user: user || { name: 'System', avatar: '' },
            action: 'added a new client',
            target: client.name,
            time: formatTimeAgo(new Date(client.created_at)),
            type: 'client'
          });
        });

        // Add invoice activities
        recentInvoices.forEach(invoice => {
          const clientName = invoice.client_id ? clientsMap.get(invoice.client_id) : 'Unknown Client';
          
          activityItems.push({
            id: `invoice-sent-${invoice.id}`,
            user: { name: 'System', avatar: '' }, // No user info for invoices in this schema
            action: 'sent an invoice',
            target: `#${invoice.number} to ${clientName}`,
            time: formatTimeAgo(new Date(invoice.created_at)),
            type: 'invoice'
          });
        });

        // Sort activities by time (most recent first)
        activityItems.sort((a, b) => {
          const timeA = parseRelativeTime(a.time);
          const timeB = parseRelativeTime(b.time);
          return timeB - timeA;
        });

        setActivities(activityItems.slice(0, 5)); // Take only the 5 most recent activities
      } catch (error) {
        console.error('Error fetching activity feed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  // Helper function to format time ago
  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffSeconds < 3600) {
      const mins = Math.floor(diffSeconds / 60);
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffSeconds < 172800) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }

  // Helper function to parse relative time for sorting
  function parseRelativeTime(relativeTime: string): number {
    if (relativeTime === 'Just now') return 0;
    
    const minutesMatch = relativeTime.match(/(\d+) minutes? ago/);
    if (minutesMatch) return parseInt(minutesMatch[1]) * 60;
    
    const hoursMatch = relativeTime.match(/(\d+) hours? ago/);
    if (hoursMatch) return parseInt(hoursMatch[1]) * 3600;
    
    if (relativeTime === 'Yesterday') return 86400;
    
    // For older dates, return a large number for sorting
    return 172800; // 2 days in seconds
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Recent actions by you and your team</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 size={24} className="animate-spin text-fixlyfy" />
            <span className="ml-2">Loading activities...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-fixlyfy-text-secondary">
            <p>No recent activity found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>
                    {" "}
                    {activity.action}
                    {" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-fixlyfy-text-secondary">{activity.time}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "ml-auto",
                    activity.type === "job" && "border-fixlyfy text-fixlyfy",
                    activity.type === "client" && "border-fixlyfy-success text-fixlyfy-success",
                    activity.type === "invoice" && "border-fixlyfy-warning text-fixlyfy-warning"
                  )}
                >
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
