
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTagColor } from "@/data/tags";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientJobsProps {
  clientId: string | undefined;
  onCreateJob: () => void;
}

export const ClientJobs = ({ clientId, onCreateJob }: ClientJobsProps) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchClientJobs() {
      if (!clientId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            technician:technician_id(
              id, 
              name
            )
          `)
          .eq('client_id', clientId);
        
        if (error) throw error;
        
        // Transform data to match component expectations
        const formattedJobs = data.map(job => ({
          id: job.id,
          client: job.title, // Using title as client name since we're in client context
          address: job.description || 'No address provided',
          service: job.service || 'General service',
          status: job.status,
          date: job.date,
          time: new Date(job.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          technician: {
            name: job.technician?.name || 'Unassigned',
            initials: job.technician?.name ? job.technician.name.substring(0, 2).toUpperCase() : 'UA'
          },
          revenue: parseFloat(job.revenue) || 0,
          tags: job.tags || []
        }));
        
        setJobs(formattedJobs);
      } catch (error) {
        console.error('Error fetching client jobs:', error);
        toast.error('Failed to load client jobs');
      } finally {
        setLoading(false);
      }
    }
    
    fetchClientJobs();
  }, [clientId]);

  const handleJobClick = (jobId: string) => {
    // Ensuring the navigation is working correctly
    console.log("Navigating to job:", jobId);
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Client Jobs</h2>
          <Button onClick={onCreateJob} className="bg-purple-500 hover:bg-purple-600">
            <Plus size={16} className="mr-2" /> New Job
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-purple-500 rounded-full" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Loading jobs...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-600">Job #</th>
                  <th className="text-left p-4 font-medium text-gray-600">Date</th>
                  <th className="text-left p-4 font-medium text-gray-600">Service</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Technician</th>
                  <th className="text-right p-4 font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr 
                    key={job.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleJobClick(job.id)}
                  >
                    <td className="p-4">
                      <span className="text-purple-500 font-medium">{job.id}</span>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2" />
                        {new Date(job.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">{job.service}</td>
                    <td className="p-4">
                      <Badge className={cn(
                        "text-xs font-medium py-1 px-2",
                        job.status === "completed" && "bg-green-100 text-green-600",
                        job.status === "in-progress" && "bg-purple-100 text-purple-600",
                        job.status === "scheduled" && "bg-yellow-100 text-yellow-600",
                        job.status === "canceled" && "bg-gray-100 text-gray-600"
                      )}>
                        {job.status === "completed" && "Completed"}
                        {job.status === "in-progress" && "In Progress"}
                        {job.status === "scheduled" && "Scheduled"}
                        {job.status === "canceled" && "Cancelled"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {job.technician.name}
                    </td>
                    <td className="p-4 text-right font-medium">
                      ${job.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && jobs.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">This client has no jobs yet.</p>
              <Button onClick={onCreateJob} className="bg-purple-500 hover:bg-purple-600">
                <Plus size={18} className="mr-2" /> Create First Job
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
