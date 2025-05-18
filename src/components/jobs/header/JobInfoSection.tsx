
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
      
      <div className="flex gap-2 items-center">
        <h2 className="text-lg font-medium">{job.client}</h2>
        <ClientContactButtons
          onCallClick={onCallClick}
          onMessageClick={onMessageClick}
          onEditClient={onEditClient}
        />
      </div>
    </div>
  );
};
