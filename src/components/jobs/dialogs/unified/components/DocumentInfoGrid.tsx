
import React from "react";
import { DocumentType } from "../../UnifiedDocumentBuilder";

interface DocumentInfoGridProps {
  documentType: DocumentType;
  enhancedClientInfo: any;
  jobAddress: string;
  issueDate?: string;
  dueDate?: string;
  taxRate: number;
  companyInfo: any;
}

export const DocumentInfoGrid = ({
  documentType,
  enhancedClientInfo,
  jobAddress,
  issueDate,
  dueDate,
  taxRate,
  companyInfo
}: DocumentInfoGridProps) => {
  const documentColor = documentType === 'estimate' ? 'text-blue-700' : 'text-purple-700';

  return (
    <div className="px-8 py-8 bg-gray-50 border-b">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Information */}
        <div>
          <h3 className={`font-bold text-xl ${documentColor} mb-4 flex items-center`}>
            <div className={`w-1 h-6 ${documentType === 'estimate' ? 'bg-blue-700' : 'bg-purple-700'} mr-3`}></div>
            {documentType === 'estimate' ? 'Estimate For' : 'Bill To'}
          </h3>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900">
                  {enhancedClientInfo?.name || 'Client Name'}
                </h4>
                {enhancedClientInfo?.company && (
                  <p className="text-gray-700 font-medium">{enhancedClientInfo.company}</p>
                )}
                {enhancedClientInfo?.type && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mt-1">
                    {enhancedClientInfo.type} Client
                  </span>
                )}
              </div>
              
              {enhancedClientInfo?.fullAddress && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">BILLING ADDRESS</p>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {enhancedClientInfo.fullAddress}
                  </p>
                </div>
              )}

              {jobAddress && jobAddress !== enhancedClientInfo?.address && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">SERVICE ADDRESS</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed font-medium">
                      {jobAddress}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 space-y-2">
                {enhancedClientInfo?.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Phone:</span>
                    <span className="text-gray-900 font-medium">{enhancedClientInfo.phone}</span>
                  </div>
                )}
                {enhancedClientInfo?.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Email:</span>
                    <span className="text-gray-900 font-medium">{enhancedClientInfo.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Document Details */}
        <div>
          <h3 className={`font-bold text-xl ${documentColor} mb-4 flex items-center`}>
            <div className={`w-1 h-6 ${documentType === 'estimate' ? 'bg-blue-700' : 'bg-purple-700'} mr-3`}></div>
            Document Details
          </h3>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {documentType === 'estimate' ? 'ESTIMATE DATE' : 'ISSUE DATE'}
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {issueDate || new Date().toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {documentType === 'estimate' ? 'VALID UNTIL' : 'DUE DATE'}
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {documentType === 'estimate' 
                      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                      : dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                    }
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Tax Rate:</span>
                  <span className="text-gray-900 font-semibold">{taxRate}%</span>
                </div>
              </div>

              {companyInfo?.taxId && companyInfo.taxId !== 'XX-XXXXXXX' && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Tax ID:</span>
                    <span className="text-gray-900 font-semibold">{companyInfo.taxId}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
