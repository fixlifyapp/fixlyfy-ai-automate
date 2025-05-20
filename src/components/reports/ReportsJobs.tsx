
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReportsJobsProps {
  period: string;
}

interface Job {
  id: string;
  client: string;
  service: string;
  technician: string;
  date: Date;
  duration: number;
  revenue: number;
}

export const ReportsJobs = ({ period }: ReportsJobsProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        // Fetch completed jobs from Supabase
        const { data: jobsData, error } = await supabase
          .from('jobs')
          .select('id, title, service, date, schedule_start, schedule_end, revenue, client_id, technician_id, status')
          .eq('status', 'completed')
          .order('date', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (!jobsData || jobsData.length === 0) {
          setJobs([]);
          setLoading(false);
          return;
        }

        // Get all client IDs to fetch client data
        const clientIds = jobsData.map(job => job.client_id).filter(Boolean);
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, name')
          .in('id', clientIds);

        // Get all technician IDs to fetch technician data
        const technicianIds = jobsData.map(job => job.technician_id).filter(Boolean);
        const { data: techniciansData } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', technicianIds);

        // Create maps for quick lookups
        const clientMap = new Map();
        if (clientsData) {
          clientsData.forEach(client => {
            clientMap.set(client.id, client.name);
          });
        }

        const technicianMap = new Map();
        if (techniciansData) {
          techniciansData.forEach(tech => {
            technicianMap.set(tech.id, tech.name);
          });
        }

        // Format job data
        const formattedJobs = jobsData.map(job => {
          const startTime = job.schedule_start ? new Date(job.schedule_start) : new Date(job.date);
          const endTime = job.schedule_end ? new Date(job.schedule_end) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
          const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (60 * 1000));
          
          return {
            id: job.id,
            client: job.client_id ? clientMap.get(job.client_id) || 'Unknown Client' : 'Unknown Client',
            service: job.service || 'General Service',
            technician: job.technician_id ? technicianMap.get(job.technician_id) || 'Unassigned' : 'Unassigned',
            date: new Date(job.date),
            duration: durationMinutes,
            revenue: parseFloat(job.revenue?.toString() || '0'),
          };
        });

        setJobs(formattedJobs);
      } catch (error) {
        console.error('Error fetching jobs data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, [period]);

  // Render mobile card view
  const renderMobileJobs = () => {
    return jobs.map((job) => (
      <div key={job.id} className="fixlyfy-card mb-4 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Job #{job.id}</span>
          <Badge className="bg-fixlyfy/10 text-fixlyfy">
            {job.service}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-fixlyfy-text-secondary">Client:</p>
            <p>{job.client}</p>
          </div>
          <div>
            <p className="text-fixlyfy-text-secondary">Technician:</p>
            <p>{job.technician}</p>
          </div>
          <div>
            <p className="text-fixlyfy-text-secondary">Date:</p>
            <p>{format(job.date, 'MMM dd, yyyy')}</p>
          </div>
          <div>
            <p className="text-fixlyfy-text-secondary">Duration:</p>
            <p>{Math.floor(job.duration / 60)}h {job.duration % 60}m</p>
          </div>
          <div className="col-span-2">
            <p className="text-fixlyfy-text-secondary">Revenue:</p>
            <p className="font-medium">${job.revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="fixlyfy-card">
      <div className="p-6 border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Recent Completed Jobs</h2>
      </div>
      <div className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 size={24} className="animate-spin text-fixlyfy" />
            <span className="ml-2">Loading jobs...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-fixlyfy-text-secondary">No completed jobs found. Use the "Generate Test Data" button to create sample jobs.</p>
          </div>
        ) : isMobile ? (
          <div className="p-4">
            {renderMobileJobs()}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job, idx) => (
                <TableRow 
                  key={job.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-fixlyfy-bg-interface/50"}
                >
                  <TableCell className="font-medium">
                    {job.id}
                  </TableCell>
                  <TableCell>
                    {job.client}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-fixlyfy/10 text-fixlyfy">
                      {job.service}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.technician}
                  </TableCell>
                  <TableCell>
                    {format(job.date, 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {Math.floor(job.duration / 60)}h {job.duration % 60}m
                  </TableCell>
                  <TableCell className="font-medium">
                    ${job.revenue.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
