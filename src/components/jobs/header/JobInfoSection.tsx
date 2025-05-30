
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
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-20" />
          <div className="flex items-start gap-3">
            <div className="flex flex-col">
              <Skeleton className="h-7 w-36 mb-2" />
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Job Info Section - Clean & Minimal */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex flex-col gap-3">
          <JobStatusBadge status={status} onStatusChange={onStatusChange} />
          
          <div className="flex items-start gap-4">
            <div className="flex flex-col min-w-0">
              <h1 className="text-2xl font-bold text-slate-800 truncate leading-tight">{job.client}</h1>
              <span className="text-sm text-slate-500 font-medium tracking-wide">#{job.id}</span>
              {job.service && (
                <span className="text-sm text-slate-600 truncate mt-0.5">{job.service}</span>
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

      {/* Financial Overview - Modern Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Invoiced */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 to-indigo-100/40 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              Invoiced
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-indigo-900">
              {formatCurrency(invoiceAmount)}
            </div>
            {(paidInvoices > 0 || unpaidInvoices > 0) && (
              <div className="text-xs text-indigo-600 font-medium">
                {paidInvoices} paid • {unpaidInvoices} pending
              </div>
            )}
          </div>
        </div>

        {/* Total Paid */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Received
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-emerald-900">
              {formatCurrency(totalPaid)}
            </div>
            {totalPaid > 0 && (
              <div className="text-xs text-emerald-600 font-medium">
                Payment received
              </div>
            )}
          </div>
        </div>
        
        {/* Balance/Outstanding */}
        <div className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
          balance > 0 
            ? "border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-amber-100/40 hover:shadow-lg hover:shadow-amber-100/50" 
            : "border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-slate-100/40 hover:shadow-lg hover:shadow-slate-100/50"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-sm ${
              balance > 0 
                ? "bg-gradient-to-br from-amber-500 to-amber-600" 
                : "bg-gradient-to-br from-slate-500 to-slate-600"
            }`}>
              {balance > 0 ? (
                <AlertCircle className="h-5 w-5 text-white" />
              ) : (
                <TrendingUp className="h-5 w-5 text-white" />
              )}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              balance > 0 ? "text-amber-700" : "text-slate-700"
            }`}>
              {balance > 0 ? "Outstanding" : "Complete"}
            </span>
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${
              balance > 0 ? "text-amber-900" : "text-slate-900"
            }`}>
              {formatCurrency(balance)}
            </div>
            {overdueAmount > 0 ? (
              <div className="text-xs text-red-600 font-medium">
                ${overdueAmount.toFixed(2)} overdue
              </div>
            ) : balance === 0 ? (
              <div className="text-xs text-slate-600 font-medium">
                Fully paid
              </div>
            ) : (
              <div className="text-xs text-amber-600 font-medium">
                Payment pending
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
