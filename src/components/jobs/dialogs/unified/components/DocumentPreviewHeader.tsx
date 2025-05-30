
import React from "react";
import { DocumentType } from "../../UnifiedDocumentBuilder";

interface DocumentPreviewHeaderProps {
  documentType: DocumentType;
  documentNumber: string;
  companyInfo: any;
}

export const DocumentPreviewHeader = ({
  documentType,
  documentNumber,
  companyInfo
}: DocumentPreviewHeaderProps) => {
  const documentTitle = documentType === 'estimate' ? 'ESTIMATE' : 'INVOICE';

  return (
    <div className="border-b border-gray-200 px-8 py-8 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {documentTitle}
          </h1>
          <div className="text-lg text-gray-600">
            #{documentNumber}
          </div>
        </div>
        
        <div className="text-right">
          {companyInfo?.logoUrl ? (
            <img 
              src={companyInfo.logoUrl} 
              alt={companyInfo.name} 
              className="h-12 w-auto mb-3 object-contain"
            />
          ) : (
            <div className="h-12 w-12 bg-fixlyfy rounded-lg flex items-center justify-center mb-3">
              <span className="text-white font-bold text-lg">
                {companyInfo?.name?.charAt(0) || 'F'}
              </span>
            </div>
          )}
          
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {companyInfo?.name || 'FixLyfy Services'}
          </h2>
          <p className="text-sm text-gray-600">
            {companyInfo?.businessType || 'Professional Services'}
          </p>
        </div>
      </div>
    </div>
  );
};
