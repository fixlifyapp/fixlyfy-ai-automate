
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
  const isEstimate = documentType === 'estimate';

  return (
    <div className="bg-gradient-to-r from-fixlyfy to-fixlyfy-light px-8 py-12 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-6xl font-bold tracking-tight mb-2">
            {documentTitle}
          </h1>
          <div className="text-2xl font-semibold opacity-90">
            #{documentNumber}
          </div>
        </div>
        
        <div className="text-right">
          {companyInfo?.logoUrl ? (
            <img 
              src={companyInfo.logoUrl} 
              alt={companyInfo.name} 
              className="h-16 w-auto mb-4 object-contain"
            />
          ) : (
            <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <span className="text-white font-bold text-2xl">
                {companyInfo?.name?.charAt(0) || 'F'}
              </span>
            </div>
          )}
          
          <h2 className="text-xl font-bold mb-1">
            {companyInfo?.name || 'FixLyfy Services'}
          </h2>
          <p className="text-sm opacity-80">
            {companyInfo?.businessType || 'Professional Services'}
          </p>
        </div>
      </div>
    </div>
  );
};
