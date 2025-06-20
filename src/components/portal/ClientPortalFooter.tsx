
import { Mail } from "lucide-react";

interface ClientPortalFooterProps {
  companyData?: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
  } | null;
}

export const ClientPortalFooter = ({ companyData }: ClientPortalFooterProps) => {
  const currentYear = new Date().getFullYear();
  
  // Use company data if available, otherwise fallback to default
  const supportEmail = companyData?.email || 'support@fixlify.app';
  const companyName = companyData?.name || 'Fixlify';

  return (
    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-gray-500">
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="font-medium text-purple-800 mb-2">Need Help?</p>
        <p className="text-purple-700 mb-3">Our support team is here to assist you with any questions.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-purple-600">
          <Mail className="h-4 w-4" />
          <span>{supportEmail}</span>
        </div>
      </div>
      <div className="mt-4">
        <p>© {currentYear} {companyName}. All rights reserved.</p>
      </div>
    </div>
  );
};
