
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
  const documentColor = documentType === 'estimate' ? 'text-blue-600' : 'text-green-600';
  const documentBg = documentType === 'estimate' ? 'bg-blue-50' : 'bg-green-50';

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-8 py-6">
        <div className="flex justify-between items-start">
          {/* Company Info */}
          <div className="flex items-start space-x-4">
            {companyInfo?.logoUrl ? (
              <img 
                src={companyInfo.logoUrl} 
                alt={companyInfo.name} 
                className="h-16 w-auto object-contain"
              />
            ) : (
              <div className="h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {companyInfo?.name?.charAt(0) || 'F'}
                </span>
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {companyInfo?.name || 'FixLyfy Services'}
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{companyInfo?.address}</p>
                <p>
                  {[companyInfo?.city, companyInfo?.state, companyInfo?.zip].filter(Boolean).join(', ')}
                </p>
                <p>{companyInfo?.phone}</p>
                <p>{companyInfo?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Document Info */}
          <div className="text-right">
            <div className={`inline-block px-4 py-2 rounded-lg ${documentBg} mb-3`}>
              <h1 className={`text-2xl font-bold ${documentColor}`}>
                {documentTitle}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Number</p>
              <p className="text-lg font-semibold text-gray-900">#{documentNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
