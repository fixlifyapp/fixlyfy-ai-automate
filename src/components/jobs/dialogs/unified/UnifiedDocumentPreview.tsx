
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
      <div className="max-w-4xl mx-auto bg-white shadow-lg p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded"></div>
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
  const documentColor = documentType === 'estimate' ? 'text-blue-600' : 'text-purple-600';
  const documentBg = documentType === 'estimate' ? 'bg-blue-50' : 'bg-purple-50';

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg">
      {/* Header */}
      <div className={`${documentBg} px-8 py-6 border-b-4 ${documentType === 'estimate' ? 'border-blue-600' : 'border-purple-600'}`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-4xl font-bold ${documentColor} mb-2`}>{documentTitle}</h1>
            <p className="text-xl text-gray-700 font-medium">#{documentNumber}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${documentColor} mb-2`}>
              {companyInfo?.name || 'FixLyfy'}
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="font-medium">{companyInfo?.businessType || companyInfo?.tagline}</p>
              <p>{companyInfo?.address}</p>
              <p>{[companyInfo?.city, companyInfo?.state, companyInfo?.zip].filter(Boolean).join(', ')}</p>
              {companyInfo?.country && companyInfo.country !== 'USA' && (
                <p>{companyInfo.country}</p>
              )}
              <p className="mt-1">
                <span className="font-medium">Phone:</span> {companyInfo?.phone}
              </p>
              <p>
                <span className="font-medium">Email:</span> {companyInfo?.email}
              </p>
              {companyInfo?.website && (
                <p>
                  <span className="font-medium">Web:</span> {companyInfo.website}
                </p>
              )}
              {companyInfo?.taxId && companyInfo.taxId !== 'XX-XXXXXXX' && (
                <p className="text-xs mt-1">
                  <span className="font-medium">Tax ID:</span> {companyInfo.taxId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document and Client Information */}
      <div className="px-8 py-6 bg-gray-50 border-b">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className={`font-bold text-lg ${documentColor} mb-3`}>
              {documentType === 'estimate' ? 'Estimate For:' : 'Bill To:'}
            </h3>
            <div className="bg-white p-4 rounded-lg border">
              <p className="font-bold text-lg text-gray-900 mb-2">
                {enhancedClientInfo?.name || 'Client Name'}
              </p>
              {enhancedClientInfo?.company && (
                <p className="text-gray-700 font-medium mb-1">{enhancedClientInfo.company}</p>
              )}
              {enhancedClientInfo?.type && (
                <p className="text-xs text-gray-500 mb-2">{enhancedClientInfo.type} Client</p>
              )}
              
              {/* Client Billing Address */}
              {enhancedClientInfo?.fullAddress && (
                <div className="text-gray-600 mb-3">
                  <p className="font-medium text-gray-700 mb-1">Billing Address:</p>
                  <p className="whitespace-pre-line">{enhancedClientInfo.fullAddress}</p>
                </div>
              )}

              {/* Job Service Address */}
              {jobAddress && jobAddress !== enhancedClientInfo?.address && (
                <div className="text-gray-600 mb-3 pt-2 border-t border-gray-200">
                  <p className="font-medium text-gray-700 mb-1">Service Address:</p>
                  <p className="whitespace-pre-line">{jobAddress}</p>
                </div>
              )}

              {/* Contact Information */}
              <div className="pt-2 border-t border-gray-200">
                {enhancedClientInfo?.phone && (
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Phone:</span> {enhancedClientInfo.phone}
                  </p>
                )}
                {enhancedClientInfo?.email && (
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Email:</span> {enhancedClientInfo.email}
                  </p>
                )}
                {enhancedClientInfo?.status && (
                  <p className="text-xs text-gray-500">
                    Status: <span className="capitalize">{enhancedClientInfo.status}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className={`font-bold text-lg ${documentColor} mb-3`}>
                Document Details
              </h3>
              <div className="bg-white p-4 rounded-lg border space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    {documentType === 'estimate' ? 'Estimate Date:' : 'Issue Date:'}
                  </span>
                  <span className="font-medium">{issueDate || new Date().toLocaleDateString()}</span>
                </div>
                
                {documentType === 'invoice' && dueDate && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Due Date:</span>
                    <span className="font-medium">{dueDate}</span>
                  </div>
                )}
                
                {documentType === 'estimate' && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Valid Until:</span>
                    <span className="font-medium">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className={`font-bold ${documentColor}`}>
                    {documentType === 'estimate' ? 'Pending Review' : 'Unpaid'}
                  </span>
                </div>

                {/* Tax Information */}
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Tax Rate:</span>
                  <span className="font-medium">{taxRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="px-8 py-6">
        <h3 className={`font-bold text-lg ${documentColor} mb-4`}>
          {documentType === 'estimate' ? 'Estimated Services & Materials' : 'Services & Materials'}
        </h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className={`${documentBg}`}>
              <tr>
                <th className="px-4 py-4 text-left text-sm font-bold text-gray-900">Description</th>
                <th className="px-4 py-4 text-center text-sm font-bold text-gray-900">Qty</th>
                <th className="px-4 py-4 text-right text-sm font-bold text-gray-900">Unit Price</th>
                <th className="px-4 py-4 text-right text-sm font-bold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lineItems.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">
                      {item.description || item.name}
                    </div>
                    {item.taxable && (
                      <div className="text-xs text-gray-500">Taxable</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-900 font-medium">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-900 font-medium">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-900 font-bold">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="px-8 py-6 bg-gray-50">
        <div className="flex justify-end">
          <div className="w-80 space-y-3">
            <div className="flex justify-between text-lg">
              <span className="font-medium text-gray-700">Subtotal:</span>
              <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-medium text-gray-700">Tax ({taxRate}%):</span>
              <span className="font-bold text-gray-900">{formatCurrency(tax)}</span>
            </div>
            <div className={`flex justify-between text-2xl font-bold border-t-2 pt-3 ${documentColor}`}>
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="px-8 py-6 border-t">
          <h3 className={`font-bold text-lg ${documentColor} mb-3`}>Notes & Instructions</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{notes}</p>
          </div>
        </div>
      )}

      {/* Terms & Policies */}
      <div className="px-8 py-6 bg-gray-50 border-t">
        <h3 className={`font-bold text-lg ${documentColor} mb-4`}>Terms & Conditions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Payment Terms</h4>
            <ul className="space-y-1 leading-relaxed">
              {documentType === 'estimate' ? (
                <>
                  <li>• Estimate valid for 30 days from issue date</li>
                  <li>• 50% deposit required to commence work</li>
                  <li>• Final payment due upon completion</li>
                  <li>• Prices subject to change if work scope increases</li>
                </>
              ) : (
                <>
                  <li>• Payment due within 30 days of invoice date</li>
                  <li>• Late payments subject to 1.5% monthly service charge</li>
                  <li>• Accepted payments: Cash, Check, Credit Card</li>
                  <li>• NSF checks subject to $35 processing fee</li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Service Guarantee</h4>
            <ul className="space-y-1 leading-relaxed">
              <li>• All work guaranteed for 90 days</li>
              <li>• Parts warranty as per manufacturer terms</li>
              <li>• Emergency service available 24/7</li>
              <li>• Licensed, bonded & insured technicians</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Important:</strong> This {documentType} contains confidential and proprietary information. 
            Any unauthorized disclosure or use is strictly prohibited. By accepting this {documentType}, 
            you agree to our terms of service and privacy policy. For questions or concerns, 
            please contact us at {companyInfo?.phone || '(555) 123-4567'} or {companyInfo?.email || 'info@fixlyfy.com'}.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={`${documentBg} px-8 py-4 border-t-4 ${documentType === 'estimate' ? 'border-blue-600' : 'border-purple-600'}`}>
        <div className="text-center">
          <p className={`text-lg font-bold ${documentColor} mb-1`}>
            Thank you for choosing {companyInfo?.name || 'FixLyfy Services'}!
          </p>
          <p className="text-sm text-gray-600">
            {companyInfo?.description || 'Professional service you can trust'} • Licensed & Insured • {companyInfo?.website || 'www.fixlyfy.com'}
          </p>
        </div>
      </div>
    </div>
  );
};
