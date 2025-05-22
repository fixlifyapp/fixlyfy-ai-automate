
import { useState } from "react";
import { useJobDetails } from "./context/JobDetailsContext";
import { AiInsightsPanel } from "./quick-actions/AiInsightsPanel";
import { QuickActionsPanel } from "./quick-actions/QuickActionsPanel";
import { initialAiSuggestions, quickActions } from "./quick-actions/initialData";

interface JobDetailsQuickActionsProps {
  jobId: string;
}

export const JobDetailsQuickActions = ({ jobId }: JobDetailsQuickActionsProps) => {
  const { job, updateJobStatus } = useJobDetails();
  const [isLoading, setIsLoading] = useState(true);
  
  // Set loading state based on job data availability
  useState(() => {
    setIsLoading(!job);
  });
  
  // Handle complete job action
  const handleCompleteJob = async () => {
    if (!jobId) return;
    return updateJobStatus('completed');
  };
  
  // If job is not loaded yet, don't render the components
  if (!job) {
    return null;
  }
  
  return (
    <>
      {/* AI Suggestions Panel */}
      <AiInsightsPanel 
        jobId={jobId}
        initialSuggestions={initialAiSuggestions}
      />
      
      {/* Quick Actions Block */}
      <QuickActionsPanel
        jobId={jobId}
        quickActions={quickActions}
        onCompleteJob={handleCompleteJob}
      />
    </>
  );
};
