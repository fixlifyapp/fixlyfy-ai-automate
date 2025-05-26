
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatusBadge } from "./JobStatusBadge";
import { ClientContactButtons } from "./ClientContactButtons";
import { DollarSign, AlertCircle, TrendingUp, CreditCard } from "lucide-react";

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
  totalPaid?: number;
  overdueAmount?: number;
  paidInvoices?: number;
  unpaidInvoices?: number;
  isLoadingFinancials?: boolean;
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
  totalPaid = 0,
  overdueAmount = 0,
  paidInvoices = 0,
  unpaidInvoices = 0,
  isLoadingFinancials = false,
  status,
  onStatusChange,
  onCallClick,
  onMessageClick,
  onEditClient
}: JobInfoSectionProps) => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (isLoadingFinancials) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-start gap-4">
            <div className="flex flex-col">
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-16 w-32 rounded-lg" />
          <Skeleton className="h-16 w-32 rounded-lg" />
          <Skeleton className="h-16 w-32 rounded-lg" />
        </div>
      </div>
    );
  }

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

      {/* Enhanced Financial Summary - 3 Minimalistic Cards */}
      <div className="flex gap-3 flex-wrap">
        {/* Total Invoice Amount */}
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100 min-w-[140px]">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-blue-600 font-medium">Total Invoiced</span>
            <span className="font-semibold text-blue-900 text-lg">
              {formatCurrency(invoiceAmount)}
            </span>
            {unpaidInvoices > 0 && (
              <span className="text-xs text-blue-500">{unpaidInvoices} unpaid</span>
            )}
          </div>
        </div>

        {/* Total Paid */}
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-lg border border-emerald-100 min-w-[140px]">
          <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-emerald-600 font-medium">Total Paid</span>
            <span className="font-semibold text-emerald-900 text-lg">
              {formatCurrency(totalPaid)}
            </span>
            {paidInvoices > 0 && (
              <span className="text-xs text-emerald-500">{paidInvoices} paid</span>
            )}
          </div>
        </div>
        
        {/* Balance/Outstanding */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border min-w-[140px] ${
          balance > 0 
            ? "bg-orange-50 border-orange-100" 
            : "bg-slate-50 border-slate-100"
        }`}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            balance > 0 
              ? "bg-orange-100" 
              : "bg-slate-100"
          }`}>
            {balance > 0 ? (
              <AlertCircle className="h-4 w-4 text-orange-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-slate-600" />
            )}
          </div>
          <div className="flex flex-col">
            <span className={`text-xs font-medium ${
              balance > 0 ? "text-orange-600" : "text-slate-600"
            }`}>
              {balance > 0 ? "Outstanding" : "Fully Paid"}
            </span>
            <span className={`font-semibold text-lg ${
              balance > 0 ? "text-orange-900" : "text-slate-900"
            }`}>
              {formatCurrency(balance)}
            </span>
            {overdueAmount > 0 && (
              <span className="text-xs text-red-500">
                ${overdueAmount.toFixed(2)} overdue
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
