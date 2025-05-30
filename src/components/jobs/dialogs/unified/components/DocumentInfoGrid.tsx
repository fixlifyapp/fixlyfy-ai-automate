
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
    <div className="bg-white px-8 py-8 border-b border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Client Information - Left Side */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-fixlyfy mb-4 uppercase tracking-wide">
            {documentType === 'estimate' ? 'Estimate For' : 'Bill To'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {enhancedClientInfo?.name || 'Client Name'}
              </h4>
              {enhancedClientInfo?.company && (
                <p className="text-fixlyfy font-medium">{enhancedClientInfo.company}</p>
              )}
            </div>
            
            {enhancedClientInfo?.fullAddress && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
                <p className="text-gray-800 leading-relaxed">
                  {enhancedClientInfo.fullAddress}
                </p>
              </div>
            )}

            {jobAddress && jobAddress !== enhancedClientInfo?.address && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Service Address</p>
                <p className="text-gray-800 leading-relaxed font-medium">
                  {jobAddress}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {enhancedClientInfo?.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-gray-900 font-medium">{enhancedClientInfo.phone}</p>
                </div>
              )}
              {enhancedClientInfo?.email && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">{enhancedClientInfo.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Company Information - Right Side */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-fixlyfy mb-4 uppercase tracking-wide">
            From
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {companyInfo?.name || 'FixLyfy Services'}
              </h4>
              {companyInfo?.businessType && (
                <p className="text-fixlyfy font-medium">{companyInfo.businessType}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
              <div className="text-gray-800 leading-relaxed">
                <p>{companyInfo?.address}</p>
                <p>
                  {[companyInfo?.city, companyInfo?.state, companyInfo?.zip].filter(Boolean).join(', ')}
                </p>
                {companyInfo?.country && companyInfo.country !== 'USA' && (
                  <p>{companyInfo.country}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-fixlyfy font-bold">{companyInfo?.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-fixlyfy font-bold">{companyInfo?.email}</p>
              </div>
              {companyInfo?.website && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Website</p>
                  <p className="text-fixlyfy font-bold">{companyInfo.website}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Details */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-fixlyfy mb-4 uppercase tracking-wide">
            Details
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {documentType === 'estimate' ? 'Estimate Date' : 'Issue Date'}
              </p>
              <p className="text-gray-900 font-semibold">
                {issueDate || new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {documentType === 'estimate' ? 'Valid Until' : 'Due Date'}
              </p>
              <p className="text-gray-900 font-semibold">
                {documentType === 'estimate' 
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                  : dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                }
              </p>
            </div>

            <div className="bg-fixlyfy/5 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-fixlyfy font-medium text-sm">Tax Rate</span>
                <span className="text-gray-900 font-bold">{taxRate}%</span>
              </div>
            </div>

            {companyInfo?.taxId && companyInfo.taxId !== 'XX-XXXXXXX' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium text-sm">Tax ID</span>
                  <span className="text-gray-900 font-semibold">{companyInfo.taxId}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
