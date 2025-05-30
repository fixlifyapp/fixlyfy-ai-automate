
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
  const documentColor = documentType === 'estimate' ? 'text-blue-700' : 'text-purple-700';
  const documentBg = documentType === 'estimate' ? 'bg-blue-50' : 'bg-purple-50';
  const accentColor = documentType === 'estimate' ? 'border-blue-700' : 'border-purple-700';

  return (
    <div className={`${documentBg} px-8 py-8 border-t-4 ${accentColor}`}>
      <div className="text-center space-y-4">
        <h4 className={`text-2xl font-bold ${documentColor}`}>
          Thank you for choosing {companyInfo?.name || 'FixLyfy Services'}!
        </h4>
        <p className="text-gray-700 text-lg">
          {companyInfo?.description || 'Professional service you can trust'}
        </p>
        <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
          <span>Licensed & Insured</span>
          <span>•</span>
          <span>24/7 Emergency Service</span>
          <span>•</span>
          <span>{companyInfo?.website || 'www.fixlyfy.com'}</span>
        </div>
        
        <div className="pt-4 border-t border-gray-300 text-xs text-gray-600 leading-relaxed">
          <p>
            This {documentType} is valid and contains confidential information. 
            For questions, contact us at {companyInfo?.phone || '(555) 123-4567'} or {companyInfo?.email || 'info@fixlyfy.com'}.
            {documentType === 'estimate' && ' Estimate valid for 30 days from issue date.'}
            {documentType === 'invoice' && ' Payment due within 30 days.'}
          </p>
        </div>
      </div>
    </div>
  );
};
