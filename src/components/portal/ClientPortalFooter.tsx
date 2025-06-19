
import { Mail } from "lucide-react";

export const ClientPortalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-gray-500">
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="font-medium text-purple-800 mb-2">Need Help?</p>
        <p className="text-purple-700 mb-3">Our support team is here to assist you with any questions.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-purple-600">
          <Mail className="h-4 w-4" />
          <span>support@fixlify.app</span>
        </div>
      </div>
      <div className="mt-4">
        <p>© {currentYear} Fixlify. All rights reserved.</p>
      </div>
    </div>
  );
};
