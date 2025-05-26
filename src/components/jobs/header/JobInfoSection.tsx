
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatusBadge } from "./JobStatusBadge";
import { ClientContactButtons } from "./ClientContactButtons";
import { DollarSign, AlertCircle, TrendingUp, CreditCard, FileText } from "lucide-react";

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
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-start gap-4">
            <div className="flex flex-col">
              <Skeleton className="h-7 w-40 mb-1" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-20 w-36 rounded-xl" />
          <Skeleton className="h-20 w-36 rounded-xl" />
          <Skeleton className="h-20 w-36 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Info Section */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex flex-col gap-3">
          <JobStatusBadge status={status} onStatusChange={onStatusChange} />
          
          <div className="flex items-start gap-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-900">{job.client}</h1>
              <span className="text-sm text-slate-500 font-medium">Job #{job.id}</span>
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
      </div>

      {/* Financial Overview - Minimalistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Invoiced */}
        <div className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Invoiced
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-900">
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
        <div className="group relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-full shadow-sm">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
              Received
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-emerald-900">
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
        <div className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:shadow-lg ${
          balance > 0 
            ? "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50" 
            : "border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm ${
              balance > 0 
                ? "bg-orange-500" 
                : "bg-slate-500"
            }`}>
              {balance > 0 ? (
                <AlertCircle className="h-5 w-5 text-white" />
              ) : (
                <TrendingUp className="h-5 w-5 text-white" />
              )}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wide ${
              balance > 0 ? "text-orange-600" : "text-slate-600"
            }`}>
              {balance > 0 ? "Outstanding" : "Complete"}
            </span>
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${
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
