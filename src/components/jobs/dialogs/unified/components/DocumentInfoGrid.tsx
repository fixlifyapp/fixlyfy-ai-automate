
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
  return (
    <div className="px-8 py-6 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Client Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            {documentType === 'estimate' ? 'Estimate For' : 'Bill To'}
          </h3>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">
              {enhancedClientInfo?.name || 'Client Name'}
            </h4>
            {enhancedClientInfo?.company && (
              <p className="text-gray-600">{enhancedClientInfo.company}</p>
            )}
            
            {enhancedClientInfo?.fullAddress && (
              <p className="text-gray-600 text-sm">
                {enhancedClientInfo.fullAddress}
              </p>
            )}

            {jobAddress && jobAddress !== enhancedClientInfo?.address && (
              <div className="pt-2">
                <p className="text-xs font-medium text-gray-500">Service Address:</p>
                <p className="text-gray-600 text-sm">{jobAddress}</p>
              </div>
            )}

            <div className="pt-2 space-y-1">
              {enhancedClientInfo?.phone && (
                <p className="text-gray-600 text-sm">{enhancedClientInfo.phone}</p>
              )}
              {enhancedClientInfo?.email && (
                <p className="text-gray-600 text-sm">{enhancedClientInfo.email}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Company Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            From
          </h3>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">
              {companyInfo?.name || 'FixLyfy Services'}
            </h4>
            {companyInfo?.businessType && (
              <p className="text-gray-600">{companyInfo.businessType}</p>
            )}

            <div className="text-gray-600 text-sm">
              <p>{companyInfo?.address}</p>
              <p>
                {[companyInfo?.city, companyInfo?.state, companyInfo?.zip].filter(Boolean).join(', ')}
              </p>
            </div>

            <div className="pt-2 space-y-1">
              <p className="text-gray-600 text-sm">{companyInfo?.phone}</p>
              <p className="text-gray-600 text-sm">{companyInfo?.email}</p>
              {companyInfo?.website && (
                <p className="text-gray-600 text-sm">{companyInfo.website}</p>
              )}
            </div>
          </div>
        </div>

        {/* Document Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Details
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500">
                {documentType === 'estimate' ? 'Estimate Date' : 'Issue Date'}
              </p>
              <p className="text-gray-900 font-medium">
                {issueDate || new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <p className="text-xs font-medium text-gray-500">
                {documentType === 'estimate' ? 'Valid Until' : 'Due Date'}
              </p>
              <p className="text-gray-900 font-medium">
                {documentType === 'estimate' 
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                  : dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                }
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Tax Rate</p>
              <p className="text-gray-900 font-medium">{taxRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
