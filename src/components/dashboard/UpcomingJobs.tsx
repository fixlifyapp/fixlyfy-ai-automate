
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Job {
  id: string;
  job_number: string;
  title: string;
  scheduled_date: string;
  status: string;
  client: {
    name: string;
    phone: string;
  };
  technician?: {
    name: string;
  };
}

interface UpcomingJobsProps {
  isRefreshing?: boolean;
}

export const UpcomingJobs = ({ isRefreshing = false }: UpcomingJobsProps) => {
  const [upcomingJobs, setUpcomingJobs] = useState<Job[]>([]);
  const [overdueJobs, setOverdueJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch upcoming jobs
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const { data: upcoming, error: upcomingError } = await supabase
          .from('jobs')
          .select('id, job_number, title, scheduled_date, status, client:client_id(name, phone), technician:technician_id(name)')
          .gte('scheduled_date', today.toISOString())
          .lte('scheduled_date', nextWeek.toISOString())
          .in('status', ['scheduled', 'pending'])
          .order('scheduled_date', { ascending: true })
          .limit(5);
          
        if (upcomingError) throw upcomingError;
        
        setUpcomingJobs(upcoming || []);
        
        // Fetch overdue jobs
        const { data: overdue, error: overdueError } = await supabase
          .from('jobs')
          .select('id, job_number, title, scheduled_date, status, client:client_id(name, phone), technician:technician_id(name)')
          .lt('scheduled_date', today.toISOString())
          .in('status', ['scheduled', 'pending'])
          .order('scheduled_date', { ascending: false })
          .limit(5);
          
        if (overdueError) throw overdueError;
        
        setOverdueJobs(overdue || []);
      } catch (error) {
        console.error('Error fetching job data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [user, isRefreshing]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Badge className="bg-fixlyfy">Scheduled</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-fixlyfy-warning border-fixlyfy-warning">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-fixlyfy-error">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Job Schedule</CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>
          View Schedule
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming ({upcomingJobs.length})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({overdueJobs.length})</TabsTrigger>
          </TabsList>
          
          {isLoading || isRefreshing ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-md animate-pulse">
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-5 w-20 bg-gray-200 rounded mr-3"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="upcoming">
                {upcomingJobs.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingJobs.map((job) => (
                      <div key={job.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-md hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-sm">
                            {job.job_number} - {job.title || job.client?.name}
                          </p>
                          <p className="text-sm text-fixlyfy-text-secondary">
                            {formatDate(job.scheduled_date)} • {job.technician?.name || 'Unassigned'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {getStatusBadge(job.status)}
                          <Button variant="ghost" size="sm" className="ml-2" onClick={() => navigate(`/jobs/${job.id}`)}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-fixlyfy-text-secondary">
                    <p>No upcoming jobs scheduled for the next week</p>
                    <Button className="mt-4" onClick={() => navigate('/jobs/new')}>
                      Create Job
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="overdue">
                {overdueJobs.length > 0 ? (
                  <div className="space-y-3">
                    {overdueJobs.map((job) => (
                      <div key={job.id} className="flex justify-between items-center p-3 border border-fixlyfy-error/10 rounded-md bg-fixlyfy-error/5">
                        <div>
                          <p className="font-medium text-sm">
                            {job.job_number} - {job.title || job.client?.name}
                          </p>
                          <p className="text-sm text-fixlyfy-error">
                            {formatDate(job.scheduled_date)} • {job.technician?.name || 'Unassigned'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Badge className="bg-fixlyfy-error">Overdue</Badge>
                          <Button variant="ghost" size="sm" className="ml-2" onClick={() => navigate(`/jobs/${job.id}`)}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-fixlyfy-text-secondary">
                    <p>No overdue jobs</p>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};
