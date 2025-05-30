
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatusBadge } from "./JobStatusBadge";
import { ClientContactButtons } from "./ClientContactButtons";
import { FileText, CreditCard, CheckCircle, Hash } from "lucide-react";
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
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-40 bg-white/20" />
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <Skeleton className="h-10 w-64 bg-white/20" />
                <Skeleton className="h-6 w-32 bg-white/20" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-2xl bg-white/20" />
                <Skeleton className="h-12 w-12 rounded-2xl bg-white/20" />
                <Skeleton className="h-12 w-12 rounded-2xl bg-white/20" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-28 rounded-2xl bg-white/20" />
            <Skeleton className="h-28 rounded-2xl bg-white/20" />
            <Skeleton className="h-28 rounded-2xl bg-white/20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
      <div className="space-y-8">
        {/* Header Section with Client Info and Actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            {/* Status Badge */}
            <JobStatusBadge status={status} onStatusChange={onStatusChange} />
            
            {/* Client Name and Job Number */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white drop-shadow-lg leading-tight">
                {job.client}
              </h1>
              <div className="flex items-center gap-2 text-white/80">
                <Hash size={16} className="drop-shadow" />
                <span className="text-lg font-semibold tracking-wide drop-shadow">
                  {job.id}
                </span>
              </div>
              {job.service && (
                <p className="text-white/90 text-lg font-medium drop-shadow">
                  {job.service}
                </p>
              )}
            </div>
          </div>
          
          {/* Contact Actions */}
          <div className="flex items-center gap-4">
            <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-3 shadow-lg">
              <ClientContactButtons
                onCallClick={onCallClick}
                onMessageClick={onMessageClick}
                onEditClient={onEditClient}
              />
            </div>
          </div>
        </div>

        {/* Financial Cards - 3D Enhanced */}
        <div className="grid grid-cols-3 gap-6">
          {/* Invoice Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative backdrop-blur-lg bg-white/20 border border-white/30 rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="h-6 w-6 text-white drop-shadow" />
                </div>
                <span className="text-xs font-bold text-white/90 uppercase tracking-wider drop-shadow">
                  Invoice
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white drop-shadow-lg">
                  {formatCurrency(invoiceAmount)}
                </div>
                {(paidInvoices > 0 || unpaidInvoices > 0) && (
                  <div className="text-sm text-white/80 font-medium drop-shadow">
                    {paidInvoices} paid • {unpaidInvoices} pending
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Received Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative backdrop-blur-lg bg-white/20 border border-white/30 rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CreditCard className="h-6 w-6 text-white drop-shadow" />
                </div>
                <span className="text-xs font-bold text-white/90 uppercase tracking-wider drop-shadow">
                  Received
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white drop-shadow-lg">
                  {formatCurrency(totalPaid)}
                </div>
                {totalPaid > 0 && (
                  <div className="text-sm text-white/80 font-medium drop-shadow">
                    Payment received
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Complete/Balance Card */}
          <div className="group relative">
            <div className={`absolute inset-0 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity ${
              balance > 0 
                ? "bg-gradient-to-br from-amber-400 to-amber-600" 
                : "bg-gradient-to-br from-green-400 to-green-600"
            }`}></div>
            <div className="relative backdrop-blur-lg bg-white/20 border border-white/30 rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CheckCircle className="h-6 w-6 text-white drop-shadow" />
                </div>
                <span className="text-xs font-bold text-white/90 uppercase tracking-wider drop-shadow">
                  {balance > 0 ? "Outstanding" : "Complete"}
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white drop-shadow-lg">
                  {formatCurrency(balance)}
                </div>
                {overdueAmount > 0 ? (
                  <div className="text-sm text-red-200 font-medium drop-shadow">
                    ${overdueAmount.toFixed(2)} overdue
                  </div>
                ) : balance === 0 ? (
                  <div className="text-sm text-white/80 font-medium drop-shadow">
                    Fully paid
                  </div>
                ) : (
                  <div className="text-sm text-white/80 font-medium drop-shadow">
                    Payment pending
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
