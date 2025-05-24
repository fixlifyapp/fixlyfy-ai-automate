
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import { JobStatusBadge } from "./JobStatusBadge";
import { ClientContactButtons } from "./ClientContactButtons";

interface JobInfoSectionProps {
  job: {
    id: string;
    clientId: string;
    client: string;
    service: string;
    address: string;
    phone: string;
    email: string;
    total: number;
  };
  invoiceAmount: number;
  balance: number;
  status: string;
  onStatusChange: (newStatus: string) => void;
  onCallClick: () => void;
  onMessageClick: () => void;
  onEditClient: () => void;
}

export const JobInfoSection = ({
  job,
  invoiceAmount,
  balance,
  status,
  onStatusChange,
  onCallClick,
  onMessageClick,
  onEditClient
}: JobInfoSectionProps) => {
  return (
    <div className="flex flex-col gap-1">
      <JobStatusBadge status={status} onStatusChange={onStatusChange} />
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <h2 className="text-lg font-medium">{job.client}</h2>
            <span className="text-sm text-muted-foreground">Job #{job.id}</span>
          </div>
          <ClientContactButtons
            onCallClick={onCallClick}
            onMessageClick={onMessageClick}
            onEditClient={onEditClient}
          />
        </div>
        
        <div className="flex gap-4 text-sm mt-1 sm:mt-0 sm:ml-4">
          <div>
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-medium">${invoiceAmount.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Balance:</span>{" "}
            <span className={`font-medium ${balance > 0 ? "text-orange-500" : "text-green-500"}`}>
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
