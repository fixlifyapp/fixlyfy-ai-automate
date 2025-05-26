
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatusBadge } from "./JobStatusBadge";
import { ClientContactButtons } from "./ClientContactButtons";
import { DollarSign, AlertCircle } from "lucide-react";

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
    <div className="flex flex-col gap-4">
      {/* Status and Job Info */}
      <div className="flex flex-col gap-3">
        <JobStatusBadge status={status} onStatusChange={onStatusChange} />
        
        <div className="flex items-start gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-slate-900">{job.client}</h2>
            <span className="text-sm text-slate-500">Job #{job.id}</span>
            {job.service && (
              <span className="text-sm text-slate-600 mt-1">{job.service}</span>
            )}
          </div>
          
          <ClientContactButtons
            onCallClick={onCallClick}
            onMessageClick={onMessageClick}
            onEditClient={onEditClient}
          />
        </div>
      </div>

      {/* Financial Summary - Minimalistic Cards */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
          <DollarSign className="h-4 w-4 text-slate-500" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Total</span>
            <span className="font-semibold text-slate-900">
              ${invoiceAmount.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
          balance > 0 
            ? "bg-orange-50 text-orange-700" 
            : "bg-emerald-50 text-emerald-700"
        }`}>
          {balance > 0 && <AlertCircle className="h-4 w-4" />}
          <div className="flex flex-col">
            <span className="text-xs opacity-75">Balance</span>
            <span className="font-semibold">
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
