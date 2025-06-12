import { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  FileText, 
  DollarSign, 
  Phone, 
  MessageSquare, 
  Calendar, 
  MapPin,
  Clock,
  User,
  Settings,
  Zap
} from "lucide-react";
import { SteppedEstimateBuilder } from "./dialogs/SteppedEstimateBuilder";
import { InvoiceBuilderDialog } from "./dialogs/InvoiceBuilderDialog";
import { useJobs } from "@/hooks/useJobs";
import { useJobHistory } from "@/hooks/useJobHistory";
import { useNavigate } from "react-router-dom";
import { extractClientInfo } from "@/types/database-types";

interface JobDetailsQuickActionsProps {
  jobId: string;
}

export const JobDetailsQuickActions = ({ jobId }: JobDetailsQuickActionsProps) => {
  const [isEstimateDialogOpen, setIsEstimateDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const { jobs, isLoading } = useJobs();
  const { addHistoryItem } = useJobHistory(jobId);
  const navigate = useNavigate();
  
  const job = jobs.find(j => j.id === jobId);
  
  // Fix client info extraction
  const getClientInfo = () => {
    if (!job?.client) return null;
    
    if (typeof job.client === 'string') {
      return {
        id: job.client_id || '',
        name: job.client,
        email: job.email,
        phone: job.phone
      };
    }
    
    if (typeof job.client === 'object' && job.client.name) {
      return {
        id: job.client.id || job.client_id || '',
        name: job.client.name,
        email: job.client.email || job.email,
        phone: job.client.phone || job.phone
      };
    }
    
    return null;
  };

  const clientInfo = getClientInfo();

  const handleCreateEstimate = async () => {
    await addHistoryItem({
      job_id: jobId,
      type: 'estimate',
      title: 'Estimate Creation Started',
      description: 'User started creating a new estimate for the job',
      meta: { action: 'create_estimate_initiated' }
    });
    setIsEstimateDialogOpen(true);
  };

  const handleCreateInvoice = async () => {
    await addHistoryItem({
      job_id: jobId,
      type: 'invoice',
      title: 'Invoice Creation Started', 
      description: 'User started creating a new invoice for the job',
      meta: { action: 'create_invoice_initiated' }
    });
    setIsInvoiceDialogOpen(true);
  };

  const handleCallClient = async () => {
    if (!clientInfo?.phone) {
      return;
    }

    await addHistoryItem({
      job_id: jobId,
      type: 'communication',
      title: 'Call Initiated',
      description: 'User navigated to Connect Center to call client',
      meta: { action: 'call_navigation', client_phone: clientInfo.phone }
    });

    navigate(`/connect?tab=calls&clientId=${clientInfo.id}&clientName=${encodeURIComponent(clientInfo.name)}&clientPhone=${encodeURIComponent(clientInfo.phone)}`);
  };

  const handleMessageClient = async () => {
    if (!clientInfo) {
      return;
    }

    await addHistoryItem({
      job_id: jobId,
      type: 'communication',
      title: 'Message Started',
      description: 'User navigated to Connect Center to message client',
      meta: { action: 'message_navigation', client_phone: clientInfo.phone }
    });

    navigate(`/connect?tab=messages&clientId=${clientInfo.id}&clientName=${encodeURIComponent(clientInfo.name)}&clientPhone=${encodeURIComponent(clientInfo.phone || "")}&autoOpen=true`);
  };

  const handleScheduleJob = async () => {
    await addHistoryItem({
      job_id: jobId,
      type: 'scheduling',
      title: 'Job Scheduling Started',
      description: 'User opened job scheduling interface',
      meta: { action: 'schedule_job_initiated' }
    });
  };

  const handleEstimateCreated = () => {
    setIsEstimateDialogOpen(false);
  };

  if (isLoading) {
    return (
      <ModernCard variant="elevated">
        <ModernCardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <>
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <ModernCardTitle icon={Zap}>
            Quick Actions
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          {/* Primary Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleCreateEstimate}
              className="w-full justify-start h-12 text-left"
              variant="default"
            >
              <Calculator className="h-4 w-4 mr-3" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Create Estimate</span>
                <span className="text-xs opacity-75">Build and send estimate</span>
              </div>
            </Button>

            <Button 
              onClick={handleCreateInvoice}
              className="w-full justify-start h-12 text-left"
              variant="default"
            >
              <FileText className="h-4 w-4 mr-3" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Create Invoice</span>
                <span className="text-xs opacity-75">Generate and send invoice</span>
              </div>
            </Button>
          </div>

          <Separator />

          {/* Communication Actions */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Communication
            </h4>
            
            <Button 
              onClick={handleCallClient}
              variant="outline" 
              className="w-full justify-start h-10"
              disabled={!clientInfo?.phone}
            >
              <Phone className="h-4 w-4 mr-3" />
              <span>Call Client</span>
              {clientInfo?.phone && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {clientInfo.phone}
                </Badge>
              )}
            </Button>

            <Button 
              onClick={handleMessageClient}
              variant="outline" 
              className="w-full justify-start h-10"
              disabled={!clientInfo?.phone}
            >
              <MessageSquare className="h-4 w-4 mr-3" />
              <span>Send Message</span>
            </Button>
          </div>

          <Separator />

          {/* Job Management */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Job Management
            </h4>
            
            <Button 
              onClick={handleScheduleJob}
              variant="outline" 
              className="w-full justify-start h-10"
            >
              <Calendar className="h-4 w-4 mr-3" />
              <span>Schedule Job</span>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-10"
            >
              <MapPin className="h-4 w-4 mr-3" />
              <span>Get Directions</span>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-10"
            >
              <User className="h-4 w-4 mr-3" />
              <span>Assign Technician</span>
            </Button>
          </div>

          {/* Job Status */}
          <Separator />
          <div className="pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline" className="capitalize">
                {job?.status || 'Unknown'}
              </Badge>
            </div>
            {job?.schedule_start && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Scheduled:</span>
                <span className="text-xs flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(job.schedule_start).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Dialogs */}
      <SteppedEstimateBuilder
        open={isEstimateDialogOpen}
        onOpenChange={setIsEstimateDialogOpen}
        jobId={jobId}
        onEstimateCreated={handleEstimateCreated}
      />

      <InvoiceBuilderDialog
        open={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        jobId={jobId}
      />
    </>
  );
};
