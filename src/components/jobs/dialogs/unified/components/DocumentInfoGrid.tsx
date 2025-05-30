
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
  const documentColor = documentType === 'estimate' ? 'text-fixlyfy' : 'text-purple-700';
  const accentColor = documentType === 'estimate' ? 'border-fixlyfy' : 'border-purple-700';
  const bgColor = documentType === 'estimate' ? 'bg-fixlyfy/5' : 'bg-purple-50';

  return (
    <div className={`px-8 py-8 ${bgColor} border-b-2 ${accentColor}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side - Client Information */}
        <div className="space-y-6">
          <div>
            <h3 className={`font-bold text-2xl ${documentColor} mb-6 flex items-center`}>
              <div className={`w-1 h-8 bg-fixlyfy mr-4`}></div>
              {documentType === 'estimate' ? 'Estimate For' : 'Bill To'}
            </h3>
          </div>

          {/* Client Card */}
          <div className="bg-white rounded-2xl border-2 border-fixlyfy/10 shadow-lg p-8">
            {/* Client Name and Company */}
            <div className="mb-6">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {enhancedClientInfo?.name || 'Client Name'}
              </h4>
              {enhancedClientInfo?.company && (
                <p className="text-lg text-fixlyfy font-semibold">{enhancedClientInfo.company}</p>
              )}
              {enhancedClientInfo?.type && (
                <span className="inline-block px-3 py-1 text-sm bg-fixlyfy/10 text-fixlyfy rounded-full mt-2 font-medium">
                  {enhancedClientInfo.type} Client
                </span>
              )}
            </div>
            
            {/* Billing Address */}
            {enhancedClientInfo?.fullAddress && (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-sm font-bold text-fixlyfy mb-3 uppercase tracking-wide">Billing Address</p>
                <p className="text-gray-800 leading-relaxed text-lg">
                  {enhancedClientInfo.fullAddress}
                </p>
              </div>
            )}

            {/* Service Address */}
            {jobAddress && jobAddress !== enhancedClientInfo?.address && (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-sm font-bold text-fixlyfy mb-3 uppercase tracking-wide">Service Address</p>
                <div className="bg-fixlyfy/5 border-l-4 border-fixlyfy rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed text-lg font-medium">
                    {jobAddress}
                  </p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-4">
              <p className="text-sm font-bold text-fixlyfy mb-3 uppercase tracking-wide">Contact Information</p>
              {enhancedClientInfo?.phone && (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600 font-medium">Phone:</span>
                  <span className="text-gray-900 font-semibold text-lg">{enhancedClientInfo.phone}</span>
                </div>
              )}
              {enhancedClientInfo?.email && (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="text-gray-900 font-semibold">{enhancedClientInfo.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Side - Company Information */}
        <div className="space-y-6">
          <div>
            <h3 className={`font-bold text-2xl ${documentColor} mb-6 flex items-center`}>
              <div className={`w-1 h-8 bg-fixlyfy mr-4`}></div>
              From
            </h3>
          </div>

          {/* Company Card */}
          <div className="bg-gradient-to-br from-fixlyfy/5 to-fixlyfy/10 rounded-2xl border-2 border-fixlyfy/20 shadow-lg p-8">
            {/* Company Logo and Name */}
            <div className="text-center mb-8">
              {companyInfo?.logoUrl ? (
                <img 
                  src={companyInfo.logoUrl} 
                  alt={companyInfo.name} 
                  className="h-20 w-auto mx-auto mb-4 object-contain"
                />
              ) : (
                <div className="h-20 w-20 bg-gradient-to-br from-fixlyfy to-fixlyfy-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-3xl">
                    {companyInfo?.name?.charAt(0) || 'F'}
                  </span>
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {companyInfo?.name || 'FixLyfy Services'}
              </h2>
              {companyInfo?.businessType && (
                <p className="text-fixlyfy font-semibold text-lg">
                  {companyInfo.businessType}
                </p>
              )}
            </div>

            {/* Company Address */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <div className="text-center space-y-2">
                <p className="text-gray-800 font-medium">{companyInfo?.address}</p>
                <p className="text-gray-800 font-medium">
                  {[companyInfo?.city, companyInfo?.state, companyInfo?.zip].filter(Boolean).join(', ')}
                </p>
                {companyInfo?.country && companyInfo.country !== 'USA' && (
                  <p className="text-gray-800 font-medium">{companyInfo.country}</p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-center">
                  <span className="text-fixlyfy font-bold text-lg">{companyInfo?.phone}</span>
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-center">
                  <span className="text-fixlyfy font-bold">{companyInfo?.email}</span>
                </p>
              </div>
              {companyInfo?.website && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-center">
                    <span className="text-fixlyfy font-bold">{companyInfo.website}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Document Details Card */}
          <div className="bg-white rounded-2xl border-2 border-fixlyfy/10 shadow-lg p-6">
            <h4 className={`font-bold text-lg ${documentColor} mb-4 flex items-center`}>
              <div className={`w-1 h-6 bg-fixlyfy mr-3`}></div>
              Document Details
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-fixlyfy/5 rounded-lg p-3">
                  <p className="text-xs font-bold text-fixlyfy mb-1 uppercase tracking-wide">
                    {documentType === 'estimate' ? 'Estimate Date' : 'Issue Date'}
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {issueDate || new Date().toLocaleDateString()}
                  </p>
                </div>
                
                <div className="bg-fixlyfy/5 rounded-lg p-3">
                  <p className="text-xs font-bold text-fixlyfy mb-1 uppercase tracking-wide">
                    {documentType === 'estimate' ? 'Valid Until' : 'Due Date'}
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {documentType === 'estimate' 
                      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                      : dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                    }
                  </p>
                </div>
              </div>

              <div className="bg-fixlyfy/5 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-fixlyfy font-bold text-sm uppercase tracking-wide">Tax Rate:</span>
                  <span className="text-gray-900 font-bold text-lg">{taxRate}%</span>
                </div>
              </div>

              {companyInfo?.taxId && companyInfo.taxId !== 'XX-XXXXXXX' && (
                <div className="bg-fixlyfy/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-fixlyfy font-bold text-sm uppercase tracking-wide">Tax ID:</span>
                    <span className="text-gray-900 font-bold">{companyInfo.taxId}</span>
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
