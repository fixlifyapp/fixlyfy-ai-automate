
import React from "react";
import { DocumentType } from "../../UnifiedDocumentBuilder";

interface DocumentInfoGridProps {
  documentType: DocumentType;
  jobData: {
    id: string;
    title: string;
    client?: any;
    description?: string;
  };
  taxRate: number;
}

export const DocumentInfoGrid = ({
  documentType,
  jobData,
  taxRate
}: DocumentInfoGridProps) => {
  console.log('=== DocumentInfoGrid Debug ===');
  console.log('Job data:', jobData);

  // Extract client info from jobData
  const clientInfo = jobData.client || {};
  const clientName = typeof clientInfo === 'string' ? clientInfo : clientInfo.name || 'Client Name';
  const clientEmail = typeof clientInfo === 'object' ? clientInfo.email : undefined;
  const clientPhone = typeof clientInfo === 'object' ? clientInfo.phone : undefined;
  const clientCompany = typeof clientInfo === 'object' ? clientInfo.company : undefined;

  return (
    <div className="px-8 py-6 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Client Information */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            {documentType === 'estimate' ? 'Estimate For' : 'Bill To'}
          </h3>
          
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">
              {clientName}
            </h4>
            
            {clientCompany && (
              <p className="text-gray-600 font-medium">{clientCompany}</p>
            )}

            <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
              {clientPhone && (
                <p className="text-gray-600">{clientPhone}</p>
              )}
              {clientEmail && (
                <p className="text-gray-600">{clientEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Document Details */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Details
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {documentType === 'estimate' ? 'Estimate Date' : 'Issue Date'}
              </span>
              <span className="font-medium text-gray-900">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">
                {documentType === 'estimate' ? 'Valid Until' : 'Due Date'}
              </span>
              <span className="font-medium text-gray-900">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Tax Rate</span>
              <span className="font-medium text-gray-900">{(taxRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
