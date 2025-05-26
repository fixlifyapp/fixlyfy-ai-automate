
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Grid, 
  List, 
  Plus, 
  Wrench, 
  Target, 
  TrendingUp, 
  Calendar,
  FileText,
  Workflow
} from "lucide-react";
import { JobsList } from "@/components/jobs/JobsList";
import { JobsFilters } from "@/components/jobs/JobsFilters";
import { ScheduleJobModal } from "@/components/schedule/ScheduleJobModal";
import { JobWorkflowManager } from "@/components/jobs/workflow/JobWorkflowManager";
import { EnhancedJobScheduler } from "@/components/jobs/scheduling/EnhancedJobScheduler";
import { JobTemplateManager } from "@/components/jobs/templates/JobTemplateManager";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

const JobsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("jobs");
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

  const handleJobScheduled = (scheduleData: any) => {
    console.log("Job scheduled:", scheduleData);
    toast.success("Job scheduled successfully!");
  };

  const handleTemplateUsed = (template: any) => {
    console.log("Using template:", template);
    toast.success(`Applied template: ${template.name}`);
    setIsCreateJobModalOpen(true);
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
        <PageHeader
          title="Job Management"
          subtitle="Manage jobs, schedules, and workflows efficiently"
          icon={Wrench}
          badges={[
            { text: "Smart Workflows", icon: Workflow, variant: "fixlyfy" },
            { text: "Automation", icon: Target, variant: "success" },
            { text: "Performance", icon: TrendingUp, variant: "info" }
          ]}
          actionButton={{
            text: "Create Job",
            icon: Plus,
            onClick: () => setIsCreateJobModalOpen(true)
          }}
        />
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" delay={200}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 gap-1">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduler
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Workflows
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <ModernCard variant="glass" className="p-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <JobsFilters />
                <div className="flex items-center gap-2">
                  <Button
                    variant={isGridView ? "ghost" : "secondary"}
                    size="sm"
                    onClick={() => setIsGridView(false)}
                    className="flex gap-2 rounded-xl"
                  >
                    <List size={18} /> List
                  </Button>
                  <Button 
                    variant={isGridView ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setIsGridView(true)}
                    className="flex gap-2 rounded-xl"
                  >
                    <Grid size={18} /> Grid
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
          </TabsContent>

          <TabsContent value="scheduler" className="space-y-6">
            <EnhancedJobScheduler onScheduled={handleJobScheduled} />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <JobTemplateManager onUseTemplate={handleTemplateUsed} />
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <ModernCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Workflow Management</h3>
                <p className="text-muted-foreground mb-6">
                  Monitor and manage job workflows. Select a job to view its workflow status.
                </p>
                <JobWorkflowManager jobId="J-2001" currentStatus="in-progress" />
              </div>
            </ModernCard>
          </TabsContent>
        </Tabs>
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
