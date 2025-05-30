
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
    <div className="bg-gray-100 px-8 py-8 border-t">
      <div className="text-center space-y-4">
        <h4 className="text-xl font-bold text-fixlyfy">
          Thank you for choosing {companyInfo?.name || 'FixLyfy Services'}!
        </h4>
        <p className="text-gray-700">
          {companyInfo?.description || 'Professional service you can trust'}
        </p>
        
        <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
          <span className="font-medium">Licensed & Insured</span>
          <span>•</span>
          <span className="font-medium">Professional Service</span>
          <span>•</span>
          <span className="font-medium">{companyInfo?.website || 'www.fixlyfy.com'}</span>
        </div>
        
        <div className="pt-4 border-t border-gray-300 text-xs text-gray-600 max-w-2xl mx-auto">
          <p>
            This {documentType} contains confidential information. 
            For questions, contact us at {companyInfo?.phone || '(555) 123-4567'} or {companyInfo?.email || 'info@fixlyfy.com'}.
            {documentType === 'estimate' && ' This estimate is valid for 30 days from the issue date.'}
            {documentType === 'invoice' && ' Payment is due within 30 days of the invoice date.'}
          </p>
        </div>
      </div>
    </div>
  );
};
