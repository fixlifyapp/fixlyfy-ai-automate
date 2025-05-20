
import { useState, useEffect } from "react";
import { useJobs } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { JobsCreateModal } from "../jobs/JobsCreateModal";
import { useNavigate } from "react-router-dom";

interface ClientJobsProps {
  clientId?: string;
}

export const ClientJobs = ({ clientId }: ClientJobsProps) => {
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const { jobs, isLoading, refreshJobs } = useJobs(clientId);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 size={32} className="animate-spin text-fixlyfy mr-2" />
        <span>Loading jobs...</span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Client Jobs</h2>
        <Button onClick={() => setIsCreateJobModalOpen(true)} className="bg-fixlyfy hover:bg-fixlyfy/90">
          <Plus size={18} className="mr-2" /> Create Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No jobs found for this client.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setIsCreateJobModalOpen(true)}
          >
            Create First Job
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Job ID</th>
                <th className="text-left p-3 font-medium">Title</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30">
                  <td className="p-3">{job.id}</td>
                  <td className="p-3">{job.title}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(job.date).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <JobsCreateModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        preselectedClientId={clientId}
        onSuccess={() => {
          refreshJobs();
        }}
      />
    </div>
  );
};
