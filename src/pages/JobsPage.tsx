
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobsList } from "@/components/jobs/JobsList";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List } from "lucide-react";
import { JobsCreateModal } from "@/components/jobs/JobsCreateModal";
import { BulkActionsBar } from "@/components/jobs/BulkActionsBar";
import { toast } from "sonner";

// Mock job data - in a real app, this would come from an API
const initialJobs = [
  {
    id: "JOB-1001",
    client: "Michael Johnson",
    status: "scheduled",
    date: "2023-05-15",
    time: "13:30",
    technician: {
      name: "Robert Smith",
      avatar: "https://i.pravatar.cc/150?img=1",
      initials: "RS",
      id: "tech-1"
    },
    priority: "medium",
    revenue: 250.00,
    service: "HVAC Repair",
    address: "123 Main St, Apt 45",
  },
  {
    id: "JOB-1002",
    client: "Sarah Williams",
    status: "in-progress",
    date: "2023-05-15",
    time: "14:45",
    technician: {
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=2",
      initials: "JD",
      id: "tech-2"
    },
    priority: "high",
    revenue: 350.00,
    service: "Plumbing",
    address: "456 Oak Ave",
  },
  {
    id: "JOB-1003",
    client: "David Brown",
    status: "completed",
    date: "2023-05-15",
    time: "11:15",
    technician: {
      name: "Emily Clark",
      avatar: "https://i.pravatar.cc/150?img=5",
      initials: "EC",
      id: "tech-3"
    },
    priority: "low",
    revenue: 175.00,
    service: "Electrical",
    address: "789 Pine St",
  },
  {
    id: "JOB-1004",
    client: "Jessica Miller",
    status: "scheduled",
    date: "2023-05-16",
    time: "09:00",
    technician: {
      name: "Robert Smith",
      avatar: "https://i.pravatar.cc/150?img=1",
      initials: "RS",
      id: "tech-1"
    },
    priority: "medium",
    revenue: 200.00,
    service: "HVAC Maintenance",
    address: "321 Elm St",
  },
  {
    id: "JOB-1005",
    client: "Thomas Anderson",
    status: "canceled",
    date: "2023-05-14",
    time: "15:30",
    technician: {
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=2",
      initials: "JD",
      id: "tech-2"
    },
    priority: "low",
    revenue: 0.00,
    service: "Electrical",
    address: "555 Maple Rd",
  },
];

const JobsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [jobs, setJobs] = useState([...initialJobs]);
  
  // Handler for bulk status updates
  const handleUpdateJobsStatus = (jobIds: string[], newStatus: string) => {
    // Update job data
    setJobs(prevJobs => 
      prevJobs.map(job => 
        jobIds.includes(job.id) ? { ...job, status: newStatus } : job
      )
    );
    
    toast.success(`Updated ${jobIds.length} jobs to "${newStatus}"`);
    setSelectedJobs([]);
  };
  
  // Handler for bulk technician assignment
  const handleAssignTechnician = (jobIds: string[], technicianId: string, technicianName: string) => {
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (jobIds.includes(job.id)) {
          // Find the technician data by id - in a real app, you'd get this from your API
          const techData = initialJobs.find(j => j.technician.id === technicianId)?.technician;
          
          return { 
            ...job, 
            technician: techData || job.technician
          };
        }
        return job;
      })
    );
    
    toast.success(`Assigned ${jobIds.length} jobs to ${technicianName}`);
    setSelectedJobs([]);
  };
  
  // Handler for bulk deletion
  const handleDeleteJobs = (jobIds: string[]) => {
    setJobs(prevJobs => prevJobs.filter(job => !jobIds.includes(job.id)));
    toast.success(`Deleted ${jobIds.length} jobs`);
    setSelectedJobs([]);
  };
  
  // Handler for sending reminders
  const handleSendReminders = (jobIds: string[], reminderType: string) => {
    // In a real app, this would trigger an API call to send reminders
    toast.success(`Sent ${reminderType.toUpperCase()} reminders to ${jobIds.length} clients`);
    setSelectedJobs([]);
  };
  
  // Handler for tagging jobs
  const handleTagJobs = (jobIds: string[], tags: string[]) => {
    // In a real app, this would update job tags via an API
    toast.success(`Tagged ${jobIds.length} jobs with ${tags.length} tags`);
    setSelectedJobs([]);
  };
  
  // Handler for marking jobs as paid
  const handleMarkAsPaid = (jobIds: string[], paymentMethod: string) => {
    toast.success(`Marked ${jobIds.length} jobs as paid via ${paymentMethod}`);
    setSelectedJobs([]);
  };

  // Handle selecting or deselecting a job
  const handleSelectJob = (jobId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };
  
  // Handle selecting or deselecting all jobs
  const handleSelectAllJobs = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedJobs(jobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };
  
  // Clear selection of jobs
  const handleClearSelection = () => {
    setSelectedJobs([]);
  };
  
  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-fixlyfy-text-secondary">
            Manage and track all your service jobs in one place.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-fixlyfy hover:bg-fixlyfy/90">
          <Plus size={18} className="mr-2" /> Create Job
        </Button>
      </div>
      
      {selectedJobs.length > 0 && (
        <BulkActionsBar 
          selectedJobs={selectedJobs} 
          onClearSelection={handleClearSelection} 
          onUpdateStatus={handleUpdateJobsStatus}
          onAssignTechnician={handleAssignTechnician}
          onDeleteJobs={handleDeleteJobs}
          onSendReminders={handleSendReminders}
          onTagJobs={handleTagJobs}
          onMarkAsPaid={handleMarkAsPaid}
        />
      )}
      
      <div className="fixlyfy-card p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <JobsFilters />
          <div className="flex items-center gap-2">
            <Button
              variant={isGridView ? "ghost" : "secondary"}
              size="sm"
              onClick={() => setIsGridView(false)}
              className="flex gap-2"
            >
              <List size={18} /> List
            </Button>
            <Button 
              variant={isGridView ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setIsGridView(true)}
              className="flex gap-2"
            >
              <Grid size={18} /> Grid
            </Button>
          </div>
        </div>
      </div>
      
      <JobsList 
        isGridView={isGridView} 
        selectedJobs={selectedJobs}
        onSelectJob={handleSelectJob}
        onSelectAllJobs={handleSelectAllJobs}
      />
      
      <JobsCreateModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </PageLayout>
  );
};

export default JobsPage;
