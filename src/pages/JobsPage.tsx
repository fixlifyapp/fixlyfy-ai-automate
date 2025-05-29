
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { ThreeDIcon } from "@/components/ui/3d-icon";
import { Floating3DIcon } from "@/components/ui/floating-3d-icon";
import { 
  Grid, 
  List, 
  Plus, 
  Wrench, 
  Target, 
  TrendingUp
} from "lucide-react";
import { JobsList } from "@/components/jobs/JobsList";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

const JobsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const { jobs, addJob } = useJobs();
  
  const handleJobCreated = async (jobData: any) => {
    try {
      const createdJob = await addJob(jobData);
      if (createdJob) {
        toast.success(`Job ${createdJob.id} created successfully!`);
        return createdJob;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAllJobs = (select: boolean) => {
    setSelectedJobs(select ? jobs.map(job => job.id) : []);
  };

  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Floating3DIcon 
            icon={Wrench} 
            variant="primary" 
            size="lg"
            floating={true}
          />
          <div>
            <PageHeader
              title="Job Management"
              subtitle="Manage your jobs efficiently with modern 3D interface"
              badges={[
                { 
                  text: "Active Jobs", 
                  icon: Target, 
                  variant: "fixlyfy",
                  customIcon: <ThreeDIcon icon={Target} size="sm" variant="success" />
                },
                { 
                  text: "Performance", 
                  icon: TrendingUp, 
                  variant: "info",
                  customIcon: <ThreeDIcon icon={TrendingUp} size="sm" variant="info" />
                }
              ]}
              actionButton={{
                text: "Create Job",
                icon: Plus,
                onClick: () => setIsCreateJobModalOpen(true),
                customIcon: <ThreeDIcon icon={Plus} size="sm" variant="primary" animated />
              }}
            />
          </div>
        </div>
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <div className="space-y-6">
          <ModernCard variant="glass" className="p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <JobsFilters />
              <div className="flex items-center gap-2">
                <Button
                  variant={isGridView ? "ghost" : "secondary"}
                  size="sm"
                  onClick={() => setIsGridView(false)}
                  className="flex gap-2 rounded-xl hover:scale-105 transition-transform"
                >
                  <ThreeDIcon icon={List} size="sm" variant="secondary" />
                  List
                </Button>
                <Button 
                  variant={isGridView ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsGridView(true)}
                  className="flex gap-2 rounded-xl hover:scale-105 transition-transform"
                >
                  <ThreeDIcon icon={Grid} size="sm" variant="primary" />
                  Grid
                </Button>
              </div>
            </div>
          </ModernCard>
          
          <JobsList 
            isGridView={isGridView}
            jobs={jobs}
            selectedJobs={selectedJobs}
            onSelectJob={handleSelectJob}
            onSelectAllJobs={handleSelectAllJobs}
          />
        </div>
      </AnimatedContainer>
      
      <ScheduleJobModal 
        open={isCreateJobModalOpen} 
        onOpenChange={setIsCreateJobModalOpen}
        onJobCreated={handleJobCreated}
        onSuccess={(job) => toast.success(`Job ${job.id} created successfully!`)}
      />
    </PageLayout>
  );
};

export default JobsPage;
