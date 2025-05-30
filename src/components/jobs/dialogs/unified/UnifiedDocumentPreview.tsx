
import React, { useState, useEffect } from "react";
import { LineItem } from "../../builder/types";
import { formatCurrency } from "@/lib/utils";
import { DocumentType } from "../UnifiedDocumentBuilder";
import { supabase } from "@/integrations/supabase/client";

interface UnifiedDocumentPreviewProps {
  documentType: DocumentType;
  documentNumber: string;
  lineItems: LineItem[];
  taxRate: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes: string;
  clientInfo?: any;
  issueDate?: string;
  dueDate?: string;
}

export const UnifiedDocumentPreview = ({
  documentType,
  documentNumber,
  lineItems,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  clientInfo,
  issueDate,
  dueDate
}: UnifiedDocumentPreviewProps) => {
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [enhancedClientInfo, setEnhancedClientInfo] = useState<any>(null);
  const [jobAddress, setJobAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch company settings
        const { data: companySettings } = await supabase
          .from('company_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (companySettings) {
          setCompanyInfo({
            name: companySettings.company_name,
            businessType: companySettings.business_type,
            address: companySettings.company_address,
            city: companySettings.company_city,
            state: companySettings.company_state,
            zip: companySettings.company_zip,
            country: companySettings.company_country,
            phone: companySettings.company_phone,
            email: companySettings.company_email,
            website: companySettings.company_website,
            taxId: companySettings.tax_id,
            logoUrl: companySettings.company_logo_url,
            tagline: companySettings.company_tagline,
            description: companySettings.company_description
          });
        } else {
          // Fallback company info
          setCompanyInfo({
            name: 'FixLyfy Services',
            businessType: 'Professional Service Solutions',
            address: '456 Professional Ave, Suite 100',
            city: 'Business City',
            state: 'BC',
            zip: 'V1V 1V1',
            country: 'Canada',
            phone: '(555) 123-4567',
            email: user.email || 'info@fixlyfy.com',
            website: 'www.fixlyfy.com',
            tagline: 'Professional Service You Can Trust',
            description: 'Licensed & Insured Professional Services'
          });
        }

        // Enhanced client data fetching
        if (clientInfo?.id) {
          const { data: fullClientData } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientInfo.id)
            .maybeSingle();
          
          if (fullClientData) {
            setEnhancedClientInfo({
              ...clientInfo,
              ...fullClientData,
              fullAddress: [
                fullClientData.address,
                [fullClientData.city, fullClientData.state, fullClientData.zip].filter(Boolean).join(', '),
                fullClientData.country !== 'USA' ? fullClientData.country : null
              ].filter(Boolean).join('\n')
            });
          }

          // Fetch job address for service location
          const { data: jobs } = await supabase
            .from('jobs')
            .select('address, property_id')
            .eq('client_id', clientInfo.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (jobs && jobs.length > 0) {
            if (jobs[0].address) {
              setJobAddress(jobs[0].address);
            } else if (jobs[0].property_id) {
              // Fetch property address if job doesn't have direct address
              const { data: property } = await supabase
                .from('client_properties')
                .select('address, city, state, zip, property_name')
                .eq('id', jobs[0].property_id)
                .maybeSingle();
              
              if (property) {
                const propertyAddress = [
                  property.property_name ? `${property.property_name}:` : '',
                  property.address,
                  [property.city, property.state, property.zip].filter(Boolean).join(', ')
                ].filter(Boolean).join('\n');
                setJobAddress(propertyAddress);
              }
            }
          }
        } else {
          setEnhancedClientInfo(clientInfo);
        }

      } catch (error) {
        console.error('Error fetching preview data:', error);
        // Set fallback data on error
        setCompanyInfo({
          name: 'FixLyfy Services',
          businessType: 'Professional Service Solutions',
          phone: '(555) 123-4567',
          email: 'info@fixlyfy.com',
          address: '456 Professional Ave, Suite 100',
          city: 'Business City',
          state: 'BC',
          zip: 'V1V 1V1',
          website: 'www.fixlyfy.com'
        });
        setEnhancedClientInfo(clientInfo);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [clientInfo]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto bg-white shadow-2xl border border-gray-200">
        <div className="animate-pulse space-y-8 p-8">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTotalTax();
  const total = calculateGrandTotal();

  const documentTitle = documentType === 'estimate' ? 'ESTIMATE' : 'INVOICE';
  const documentColor = documentType === 'estimate' ? 'text-blue-700' : 'text-purple-700';
  const documentBg = documentType === 'estimate' ? 'bg-blue-50' : 'bg-purple-50';
  const accentColor = documentType === 'estimate' ? 'border-blue-700' : 'border-purple-700';

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-2xl border border-gray-200 print:shadow-none print:border-gray-300">
      {/* Professional Header */}
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

      {/* Document Information Grid */}
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
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{jobAddress}</p>
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

      {/* Line Items */}
      <div className="px-8 py-8">
        <h3 className={`font-bold text-xl ${documentColor} mb-6 flex items-center`}>
          <div className={`w-1 h-6 ${documentType === 'estimate' ? 'bg-blue-700' : 'bg-purple-700'} mr-3`}></div>
          {documentType === 'estimate' ? 'Estimated Services & Materials' : 'Services & Materials'}
        </h3>
        
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Qty</th>
                <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lineItems.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-semibold text-gray-900 text-base">
                        {item.description || item.name}
                      </p>
                      {item.taxable && (
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded mt-1">
                          Taxable
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-gray-900 font-semibold text-base">{item.quantity}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-gray-900 font-semibold text-base">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-gray-900 font-bold text-lg">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Section */}
      <div className="px-8 py-8 bg-gray-50 border-t">
        <div className="flex justify-end">
          <div className="w-96">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium text-gray-700">Tax ({taxRate}%):</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className={`flex justify-between items-center text-2xl font-bold ${documentColor}`}>
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {notes && (
        <div className="px-8 py-8 border-t">
          <h3 className={`font-bold text-xl ${documentColor} mb-4 flex items-center`}>
            <div className={`w-1 h-6 ${documentType === 'estimate' ? 'bg-blue-700' : 'bg-purple-700'} mr-3`}></div>
            Notes & Instructions
          </h3>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">{notes}</p>
          </div>
        </div>
      )}

      {/* Professional Footer */}
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
    </div>
  );
};
