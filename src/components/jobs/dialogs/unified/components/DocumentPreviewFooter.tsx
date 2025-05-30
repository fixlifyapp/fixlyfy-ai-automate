
import React from "react";
import { DocumentType } from "../../UnifiedDocumentBuilder";

interface DocumentPreviewFooterProps {
  documentType: DocumentType;
  companyInfo: any;
}

export const DocumentPreviewFooter = ({
  documentType,
  companyInfo
}: DocumentPreviewFooterProps) => {
  return (
    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
      <div className="text-center space-y-3">
        <h4 className="text-lg font-semibold text-gray-900">
          Thank you for choosing {companyInfo?.name || 'FixLyfy Services'}!
        </h4>
        
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            This {documentType} contains confidential information. 
            For questions, contact us at {companyInfo?.phone || '(555) 123-4567'} or {companyInfo?.email || 'info@fixlyfy.com'}.
          </p>
          {documentType === 'estimate' && (
            <p>This estimate is valid for 30 days from the issue date.</p>
          )}
          {documentType === 'invoice' && (
            <p>Payment is due within 30 days of the invoice date.</p>
          )}
        </div>
      </div>
    </div>
  );
};
