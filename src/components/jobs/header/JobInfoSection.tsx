
import { Badge } from "@/components/ui/badge";
import { StatusSelector } from "@/components/jobs/header/StatusSelector";
import { ClientContactButtons } from "@/components/jobs/header/ClientContactButtons";
import { formatCurrency } from "@/lib/utils";

interface JobInfoSectionProps {
  job: {
    id: string;
    title: string;
    client: string;
    clientId?: string;
    phone?: string;
    email?: string;
    address: string;
    scheduledDate?: string;
    priority?: string;
  };
  status: string;
  onStatusChange: (status: string) => void;
  onCallClick: () => void;
  onMessageClick: () => void;
  onEditClient: () => void;
  invoiceAmount?: number;
  balance?: number;
}

export const JobInfoSection = ({
  job,
  status,
  onStatusChange,
  onCallClick,
  onMessageClick,
  onEditClient,
  invoiceAmount,
  balance
}: JobInfoSectionProps) => {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-xl font-semibold">{job.title}</h1>
        <StatusSelector 
          currentStatus={status} 
          onStatusChange={onStatusChange} 
        />
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{job.client}</span>
          <ClientContactButtons 
            onCallClick={onCallClick}
            onMessageClick={onMessageClick}
            onEditClient={onEditClient}
            clientId={job.clientId}
            clientName={job.client}
            clientPhone={job.phone}
          />
        </div>
        
        {job.phone && (
          <span>{job.phone}</span>
        )}
        
        {job.email && (
          <span>{job.email}</span>
        )}
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
        <span>{job.address}</span>
        
        {job.scheduledDate && (
          <span>Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}</span>
        )}
        
        {job.priority && (
          <Badge variant={job.priority === 'high' ? 'destructive' : 'secondary'}>
            {job.priority}
          </Badge>
        )}
      </div>
      
      {(invoiceAmount !== undefined || balance !== undefined) && (
        <div className="flex gap-4 text-sm">
          {invoiceAmount !== undefined && (
            <span className="text-muted-foreground">
              Invoice: <span className="font-medium">{formatCurrency(invoiceAmount)}</span>
            </span>
          )}
          {balance !== undefined && (
            <span className="text-muted-foreground">
              Balance: <span className={`font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(balance)}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
