
import { Badge } from "@/components/ui/badge";
import { JobStatusBadge } from "./JobStatusBadge";
import { ClientContactButtons } from "./ClientContactButtons";
import { FileText, CreditCard, CheckCircle, Hash, MapPin } from "lucide-react";
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
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
        <div className="space-y-4">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            {/* Status Badge */}
            <JobStatusBadge status={status} onStatusChange={onStatusChange} />
            
            {/* Client Name and Job Number */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {job.client}
              </h1>
              <div className="flex items-center gap-2 text-blue-600">
                <Hash size={16} />
                <span className="text-lg font-semibold">
                  {job.id}
                </span>
              </div>
              {job.service && (
                <p className="text-gray-700 text-lg font-medium">
                  {job.service}
                </p>
              )}
            </div>
          </div>
          
          {/* Contact Actions */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm">
            <ClientContactButtons
              onCallClick={onCallClick}
              onMessageClick={onMessageClick}
              onEditClient={onEditClient}
            />
          </div>
        </div>

        {/* Job Address */}
        {job.address && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Service Address</p>
                <p className="text-blue-800 font-medium leading-relaxed">
                  {job.address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Financial Cards - Simplified Design */}
        <div className="grid grid-cols-3 gap-4">
          {/* Invoice Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Invoice
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(invoiceAmount)}
              </div>
              {(paidInvoices > 0 || unpaidInvoices > 0) && (
                <div className="text-sm text-blue-700 font-medium">
                  {paidInvoices} paid • {unpaidInvoices} pending
                </div>
              )}
            </div>
          </div>

          {/* Received Card */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                Received
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(totalPaid)}
              </div>
              {totalPaid > 0 && (
                <div className="text-sm text-green-700 font-medium">
                  Payment received
                </div>
              )}
            </div>
          </div>
          
          {/* Complete/Balance Card */}
          <div className={`${
            balance > 0 
              ? "bg-amber-50 border-amber-200" 
              : "bg-emerald-50 border-emerald-200"
          } border rounded-xl p-4 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                balance > 0 ? "bg-amber-100" : "bg-emerald-100"
              }`}>
                <CheckCircle className={`h-5 w-5 ${
                  balance > 0 ? "text-amber-600" : "text-emerald-600"
                }`} />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                balance > 0 ? "text-amber-700" : "text-emerald-700"
              }`}>
                {balance > 0 ? "Outstanding" : "Complete"}
              </span>
            </div>
            <div className="space-y-1">
              <div className={`text-2xl font-bold ${
                balance > 0 ? "text-amber-900" : "text-emerald-900"
              }`}>
                {formatCurrency(balance)}
              </div>
              {overdueAmount > 0 ? (
                <div className="text-sm text-red-600 font-medium">
                  ${overdueAmount.toFixed(2)} overdue
                </div>
              ) : balance === 0 ? (
                <div className="text-sm text-emerald-700 font-medium">
                  Fully paid
                </div>
              ) : (
                <div className="text-sm text-amber-700 font-medium">
                  Payment pending
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
