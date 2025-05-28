
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatusBadge } from "./JobStatusBadge";
import { ClientContactButtons } from "./ClientContactButtons";
import { DollarSign, AlertCircle, TrendingUp, CreditCard, FileText } from "lucide-react";
import { useJobFinancials } from "@/hooks/useJobFinancials";

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
  status: string;
  onStatusChange: (newStatus: string) => void;
  onCallClick: () => void;
  onMessageClick: () => void;
  onEditClient: () => void;
}

export const JobInfoSection = ({
  job,
  status,
  onStatusChange,
  onCallClick,
  onMessageClick,
  onEditClient
}: JobInfoSectionProps) => {
  // Use the real-time financial hook instead of passed props
  const {
    invoiceAmount,
    balance,
    totalPaid,
    overdueAmount,
    paidInvoices,
    unpaidInvoices,
    isLoading: isLoadingFinancials
  } = useJobFinancials(job.id);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (isLoadingFinancials) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-20" />
          <div className="flex items-start gap-3">
            <div className="flex flex-col">
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Job Info Section - Simplified */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div className="flex flex-col gap-2">
          <JobStatusBadge status={status} onStatusChange={onStatusChange} />
          
          <div className="flex items-start gap-3">
            <div className="flex flex-col min-w-0">
              <h1 className="text-xl font-bold text-slate-900 truncate">{job.client}</h1>
              <span className="text-xs text-slate-500 font-medium">Job #{job.id}</span>
              {job.service && (
                <span className="text-sm text-slate-600 truncate">{job.service}</span>
              )}
            </div>
            
            <ClientContactButtons
              onCallClick={onCallClick}
              onMessageClick={onMessageClick}
              onEditClient={onEditClient}
            />
          </div>
        </div>
      </div>

      {/* Financial Overview - Compact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Invoiced */}
        <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-blue-50/80 p-3 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
              Invoiced
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-blue-900">
              {formatCurrency(invoiceAmount)}
            </div>
            {(paidInvoices > 0 || unpaidInvoices > 0) && (
              <div className="text-xs text-blue-600">
                {paidInvoices} paid • {unpaidInvoices} pending
              </div>
            )}
          </div>
        </div>

        {/* Total Paid */}
        <div className="relative overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-lg">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
              Received
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-emerald-900">
              {formatCurrency(totalPaid)}
            </div>
            {totalPaid > 0 && (
              <div className="text-xs text-emerald-600">
                Payment received
              </div>
            )}
          </div>
        </div>
        
        {/* Balance/Outstanding */}
        <div className={`relative overflow-hidden rounded-lg border p-3 transition-shadow hover:shadow-md ${
          balance > 0 
            ? "border-orange-200 bg-orange-50/80" 
            : "border-slate-200 bg-slate-50/80"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              balance > 0 
                ? "bg-orange-500" 
                : "bg-slate-500"
            }`}>
              {balance > 0 ? (
                <AlertCircle className="h-4 w-4 text-white" />
              ) : (
                <TrendingUp className="h-4 w-4 text-white" />
              )}
            </div>
            <span className={`text-xs font-medium uppercase tracking-wide ${
              balance > 0 ? "text-orange-600" : "text-slate-600"
            }`}>
              {balance > 0 ? "Outstanding" : "Complete"}
            </span>
          </div>
          <div className="space-y-1">
            <div className={`text-xl font-bold ${
              balance > 0 ? "text-orange-900" : "text-slate-900"
            }`}>
              {formatCurrency(balance)}
            </div>
            {overdueAmount > 0 ? (
              <div className="text-xs text-red-600 font-medium">
                ${overdueAmount.toFixed(2)} overdue
              </div>
            ) : balance === 0 ? (
              <div className="text-xs text-slate-600">
                Fully paid
              </div>
            ) : (
              <div className="text-xs text-orange-600">
                Payment pending
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
