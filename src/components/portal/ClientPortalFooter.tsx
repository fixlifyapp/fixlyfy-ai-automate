
import { Mail, Phone, Globe } from "lucide-react";

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
  
  // Debug logging
  console.log("🦶 ClientPortalFooter received companyData:", companyData);
  
  // Use company business email if available, otherwise fallback to default
  const supportEmail = companyData?.email || 'support@fixlify.app';
  const companyName = companyData?.name || 'Fixlify';
  const companyPhone = companyData?.phone;
  const companyWebsite = companyData?.website;

  console.log("🦶 ClientPortalFooter resolved values:", {
    supportEmail,
    companyName,
    companyPhone,
    companyWebsite
  });

  return (
    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-gray-500">
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="font-medium text-purple-800 mb-2">Need Help?</p>
        <p className="text-purple-700 mb-3">Our support team is here to assist you with any questions.</p>
        
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-purple-600">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${supportEmail}`} className="hover:underline">{supportEmail}</a>
          </div>
          
          {companyPhone && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-purple-600">
              <Phone className="h-4 w-4" />
              <a href={`tel:${companyPhone}`} className="hover:underline">{companyPhone}</a>
            </div>
          )}
          
          {companyWebsite && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-purple-600">
              <Globe className="h-4 w-4" />
              <a href={companyWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {companyWebsite.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <p>© {currentYear} {companyName}. All rights reserved.</p>
        <p className="text-xs mt-1 text-gray-400">Powered by Fixlify</p>
      </div>
    </div>
  );
};
