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
    return <div className="bg-gradient-to-br from-fixlyfy/5 to-fixlyfy-light/10 backdrop-blur-sm border border-fixlyfy/20 rounded-2xl p-4 shadow-lg">
        <div className="space-y-3">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>;
  }
  return <div className="bg-gradient-to-br from-fixlyfy/5 to-fixlyfy-light/10 backdrop-blur-sm border border-fixlyfy/20 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {/* Compact Status Badge Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-fixlyfy to-fixlyfy-light rounded-lg blur-sm opacity-30 transform translate-y-0.5"></div>
              <div className="relative bg-gradient-to-r from-fixlyfy to-fixlyfy-light p-2 rounded-lg shadow-lg border border-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-medium uppercase tracking-wide">Status</span>
                </div>
                <div className="mt-1">
                  <JobStatusBadge status={status} onStatusChange={onStatusChange} className="bg-white/90 text-fixlyfy border-white/30 hover:bg-white shadow-md text-xs h-6" />
                </div>
              </div>
            </div>
            
            {/* Client Name, Job Number and Contact Actions */}
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {job.client}
                </h1>
                <div className="flex items-center gap-2 text-fixlyfy">
                  <Hash size={14} />
                  <span className="text-base font-semibold">
                    {job.id}
                  </span>
                </div>
              </div>
              
              {/* Contact Actions - moved closer to name */}
              <div className="bg-fixlyfy/5 border border-fixlyfy/20 rounded-lg p-2 shadow-sm">
                <ClientContactButtons onCallClick={onCallClick} onMessageClick={onMessageClick} onEditClient={onEditClient} />
              </div>
            </div>
            
            {/* Service info */}
            
          </div>
        </div>

        {/* Job Address */}
        {job.address && <div className="bg-fixlyfy/10 border border-fixlyfy/20 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-fixlyfy mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-fixlyfy mb-1">Service Address</p>
                <p className="text-fixlyfy/80 font-medium leading-relaxed text-sm">
                  {job.address}
                </p>
              </div>
            </div>
          </div>}

        {/* Smaller Financial Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Invoice Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Invoice
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-blue-900">
                {formatCurrency(invoiceAmount)}
              </div>
              {(paidInvoices > 0 || unpaidInvoices > 0) && <div className="text-xs text-blue-700 font-medium">
                  {paidInvoices} paid • {unpaidInvoices} pending
                </div>}
            </div>
          </div>

          {/* Received Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-green-100 rounded-md">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                Received
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold text-green-900">
                {formatCurrency(totalPaid)}
              </div>
              {totalPaid > 0 && <div className="text-xs text-green-700 font-medium">
                  Payment received
                </div>}
            </div>
          </div>
          
          {/* Complete/Balance Card */}
          <div className={`${balance > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"} border rounded-lg p-3 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-md ${balance > 0 ? "bg-amber-100" : "bg-emerald-100"}`}>
                <CheckCircle className={`h-4 w-4 ${balance > 0 ? "text-amber-600" : "text-emerald-600"}`} />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${balance > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                {balance > 0 ? "Outstanding" : "Complete"}
              </span>
            </div>
            <div className="space-y-1">
              <div className={`text-xl font-bold ${balance > 0 ? "text-amber-900" : "text-emerald-900"}`}>
                {formatCurrency(balance)}
              </div>
              {overdueAmount > 0 ? <div className="text-xs text-red-600 font-medium">
                  ${overdueAmount.toFixed(2)} overdue
                </div> : balance === 0 ? <div className="text-xs text-emerald-700 font-medium">
                  Fully paid
                </div> : <div className="text-xs text-amber-700 font-medium">
                  Payment pending
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
};