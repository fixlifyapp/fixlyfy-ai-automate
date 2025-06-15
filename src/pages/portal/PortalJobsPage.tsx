
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Calendar, MapPin, Clock, User, FileText, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface Job {
  id: string;
  title: string;
  description?: string;
  status: string;
  address?: string;
  schedule_start?: string;
  schedule_end?: string;
  created_at: string;
  technician?: {
    name: string;
    phone?: string;
  };
  estimates_count: number;
  invoices_count: number;
}

export default function PortalJobsPage() {
  const { user } = useClientPortalAuth();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const jobId = searchParams.get('id');

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user, jobId]);

  const fetchJobs = async () => {
    if (!user?.clientId) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          status,
          address,
          schedule_start,
          schedule_end,
          created_at,
          technicians:assigned_technician_id (
            name,
            phone
          )
        `)
        .eq('client_id', user.clientId)
        .order('created_at', { ascending: false });

      if (jobId) {
        query = query.eq('id', jobId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load projects');
        return;
      }

      // Get estimates and invoices count for each job
      const jobsWithCounts = await Promise.all(
        (data || []).map(async (job) => {
          const [estimatesResult, invoicesResult] = await Promise.all([
            supabase.from('estimates').select('id', { count: 'exact' }).eq('job_id', job.id),
            supabase.from('invoices').select('id', { count: 'exact' }).eq('job_id', job.id)
          ]);

          return {
            ...job,
            technician: Array.isArray(job.technicians) ? job.technicians[0] : job.technicians,
            estimates_count: estimatesResult.count || 0,
            invoices_count: invoicesResult.count || 0
          };
        })
      );

      setJobs(jobsWithCounts);

      if (jobId && jobsWithCounts.length > 0) {
        setSelectedJob(jobsWithCounts[0]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <PortalLayout>
        <LoadingSkeleton type="card" />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600">
            {jobId ? 'Project details and updates' : 'View all your service projects and their status'}
          </p>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600">
                  {jobId ? 'This project was not found.' : "You don't have any projects yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Jobs List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {jobs.length} Project{jobs.length !== 1 ? 's' : ''}
              </h2>
              
              {jobs.map((job) => (
                <Card 
                  key={job.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedJob?.id === job.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedJob(job)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        {job.description && (
                          <CardDescription className="mt-1 line-clamp-2">
                            {job.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      {job.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{job.address}</span>
                        </div>
                      )}
                      {job.schedule_start && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Scheduled: {formatDate(job.schedule_start)}</span>
                        </div>
                      )}
                      {job.technician && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Technician: {job.technician.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{job.estimates_count} Estimates</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Receipt className="h-4 w-4" />
                          <span>{job.invoices_count} Invoices</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Job Details */}
            <div>
              {selectedJob ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedJob.title}
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(selectedJob.status)}>
                          {selectedJob.status}
                        </Badge>
                      </div>
                    </CardTitle>
                    {selectedJob.description && (
                      <CardDescription>
                        {selectedJob.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Project Information</h4>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {formatDate(selectedJob.created_at)}</span>
                        </div>
                        {selectedJob.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{selectedJob.address}</span>
                          </div>
                        )}
                        {selectedJob.schedule_start && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              Scheduled: {formatDate(selectedJob.schedule_start)}
                              {selectedJob.schedule_end && ` - ${new Date(selectedJob.schedule_end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          </div>
                        )}
                        {selectedJob.technician && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                              Technician: {selectedJob.technician.name}
                              {selectedJob.technician.phone && ` (${selectedJob.technician.phone})`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-blue-900">{selectedJob.estimates_count}</p>
                          <p className="text-xs text-blue-700">Estimates</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <Receipt className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-green-900">{selectedJob.invoices_count}</p>
                          <p className="text-xs text-green-700">Invoices</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1" onClick={() => window.open(`/portal/estimates?jobId=${selectedJob.id}`, '_blank')}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Estimates
                      </Button>
                      <Button variant="outline" onClick={() => window.open(`/portal/invoices?jobId=${selectedJob.id}`, '_blank')}>
                        <Receipt className="h-4 w-4 mr-2" />
                        View Invoices
                      </Button>
                    </div>

                    {selectedJob.status === 'scheduled' && selectedJob.schedule_start && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Upcoming Appointment</h4>
                        <p className="text-sm text-blue-800">
                          Your service is scheduled for {formatDate(selectedJob.schedule_start)}.
                          {selectedJob.technician && ` Your technician ${selectedJob.technician.name} will contact you before arrival.`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-gray-500">
                      <Briefcase className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a project to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
