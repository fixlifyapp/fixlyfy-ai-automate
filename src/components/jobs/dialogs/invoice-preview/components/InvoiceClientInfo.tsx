
import { User, MapPin } from "lucide-react";

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
}

interface InvoiceClientInfoProps {
  clientInfo: ClientInfo | null;
  jobAddress: string;
}

export const InvoiceClientInfo = ({ clientInfo, jobAddress }: InvoiceClientInfoProps) => {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">To:</h3>
      <div className="text-gray-700">
        <div className="font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          {clientInfo?.name || 'Client Name'}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-4" />
          {clientInfo?.email || 'client@example.com'}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-4" />
          {clientInfo?.phone || '(555) 123-4567'}
        </div>
        {jobAddress && (
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="h-4 w-4" />
            {jobAddress}
          </div>
        )}
      </div>
    </div>
  );
};
