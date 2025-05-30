
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
  const documentColor = documentType === 'estimate' ? 'text-blue-700' : 'text-purple-700';
  const documentBg = documentType === 'estimate' ? 'bg-blue-50' : 'bg-purple-50';
  const accentColor = documentType === 'estimate' ? 'border-blue-700' : 'border-purple-700';

  return (
    <div className={`${documentBg} px-8 py-8 border-b-4 ${accentColor} relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className={`text-5xl font-bold ${documentColor} mb-3 tracking-tight`}>
              {documentTitle}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-semibold text-gray-700">#{documentNumber}</span>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${documentColor} bg-white bg-opacity-80`}>
                {documentType === 'estimate' ? 'Pending Review' : 'Payment Due'}
              </div>
            </div>
          </div>
          
          {/* Company Logo and Info */}
          <div className="text-right flex-shrink-0">
            <div className="flex flex-col items-end">
              {companyInfo?.logoUrl ? (
                <img 
                  src={companyInfo.logoUrl} 
                  alt={companyInfo.name} 
                  className="h-20 w-auto mb-4 object-contain"
                />
              ) : (
                <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {companyInfo?.name?.charAt(0) || 'F'}
                  </span>
                </div>
              )}
              
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {companyInfo?.name || 'FixLyfy Services'}
                </h2>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {companyInfo?.businessType || companyInfo?.tagline}
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{companyInfo?.address}</p>
                  <p>{[companyInfo?.city, companyInfo?.state, companyInfo?.zip].filter(Boolean).join(', ')}</p>
                  {companyInfo?.country && companyInfo.country !== 'USA' && (
                    <p>{companyInfo.country}</p>
                  )}
                  <p className="font-medium">{companyInfo?.phone}</p>
                  <p className="font-medium">{companyInfo?.email}</p>
                  {companyInfo?.website && (
                    <p className="text-blue-600">{companyInfo.website}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
