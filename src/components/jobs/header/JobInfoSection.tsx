
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
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Badge variant="outline" className="text-sm px-3 py-1 border-fixlyfy/20">
          {job.id}
        </Badge>
        <JobStatusBadge status={status} onStatusChange={onStatusChange} />
        <div className="flex gap-1">
          <Badge className="bg-fixlyfy/10 text-fixlyfy border-none">HVAC</Badge>
          <Badge className="bg-fixlyfy/10 text-fixlyfy border-none">Residential</Badge>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Tag size={14} />
          </Button>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <h2 className="text-lg font-medium">{job.client}</h2>
        <ClientContactButtons
          onCallClick={onCallClick}
          onMessageClick={onMessageClick}
          onEditClient={onEditClient}
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="text-sm">
          <span className="text-fixlyfy-text-secondary">Total:</span> 
          <span className="ml-1 font-medium">${job.total.toFixed(2)}</span>
        </div>
        <div className="text-sm">
          <span className="text-fixlyfy-text-secondary">Invoice:</span> 
          <span className="ml-1 font-medium">${invoiceAmount.toFixed(2)}</span>
        </div>
        <div className="text-sm">
          <span className="text-fixlyfy-text-secondary">Balance:</span> 
          <span className="ml-1 font-medium">${balance.toFixed(2)}</span>
        </div>
      </div>
      <p className="text-fixlyfy-text-secondary text-sm mt-2">
        {job.address}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-fixlyfy-text-secondary mt-2">
        <span>{job.phone}</span>
        <span>{job.email}</span>
      </div>
    </div>
  );
};
