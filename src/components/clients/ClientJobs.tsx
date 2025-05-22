import { useState, useEffect } from "react";
import { useJobs } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { JobsCreateModal } from "../jobs/JobsCreateModal";
import { useNavigate } from "react-router-dom";
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
  if (isLoading) {
    return <div className="flex justify-center items-center py-12">
        <Loader2 size={32} className="animate-spin text-fixlyfy mr-2" />
        <span>Loading jobs...</span>
      </div>;
  }
  return;
};