
import { useState, useEffect } from "react";
import { useJobs } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, FileText, Calendar } from "lucide-react";
import { JobsCreateModal } from "../jobs/JobsCreateModal";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface ClientJobsProps {
  clientId?: string;
}

export const ClientJobs = ({
  clientId
}: ClientJobsProps) => {
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const {
    jobs,
    isLoading,
    refreshJobs
  } = useJobs(clientId);
  const navigate = useNavigate();

  const handleJobCreated = () => {
    refreshJobs();
  };
  
  const navigateToJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-12">
        <Loader2 size={32} className="animate-spin text-fixlify mr-2" />
        <span>Loading jobs...</span>
      </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Client Jobs</h2>
        <Button 
          onClick={() => setIsCreateJobModalOpen(true)}
          className="bg-fixlify hover:bg-fixlify/90"
        >
          <Plus size={18} className="mr-2" /> Create Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="fixlify-card p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-fixlify-text-muted mb-4" />
            <h3 className="text-lg font-medium mb-1">No jobs found</h3>
            <p className="text-fixlify-text-secondary mb-4">This client doesn't have any jobs yet.</p>
            <Button 
              onClick={() => setIsCreateJobModalOpen(true)}
              className="bg-fixlify hover:bg-fixlify/90"
            >
              <Plus size={18} className="mr-2" /> Create First Job
            </Button>
          </div>
        </div>
      ) : (
        <div className="fixlify-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Job ID</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map(job => (
                  <tr 
                    key={job.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigateToJob(job.id)}
                  >
                    <td className="py-3 px-4">{job.id}</td>
                    <td className="py-3 px-4">{job.service || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
                          job.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {job.date ? format(new Date(job.date), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">${job.revenue?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <JobsCreateModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        preselectedClientId={clientId}
        onSuccess={handleJobCreated}
      />
    </div>
  );
};
