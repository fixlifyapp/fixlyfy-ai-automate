
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, FileText, Send, Phone, User, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  isWarranty?: boolean;
}

interface DocumentData {
  type: 'estimate' | 'invoice';
  items: LineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string;
  sendVia: 'email' | 'sms';
  sendTo: string;
}

interface SendDocumentProps {
  documentData: DocumentData;
  onDataChange: (data: DocumentData) => void;
  clientInfo?: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export const SendDocument = ({ documentData, onDataChange, clientInfo }: SendDocumentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const isMobile = useIsMobile();

  const updateSendMethod = (method: 'email' | 'sms') => {
    onDataChange({
      ...documentData,
      sendVia: method,
      sendTo: method === 'email' ? (clientInfo?.email || '') : (clientInfo?.phone || '')
    });
  };

  const updateSendTo = (value: string) => {
    onDataChange({
      ...documentData,
      sendTo: value
    });
  };

  const updateNotes = (value: string) => {
    onDataChange({
      ...documentData,
      notes: value
    });
  };

  const getDefaultMessage = () => {
    const docType = documentData.type === 'estimate' ? 'estimate' : 'invoice';
    if (documentData.sendVia === 'email') {
      return `Hi ${clientInfo?.name || ''},

Please find your ${docType} attached. 

Total: ${formatCurrency(documentData.total)}

If you have any questions, please don't hesitate to reach out.

Best regards,
Your Service Team`;
    } else {
      return `Hi ${clientInfo?.name || ''}, your ${docType} for ${formatCurrency(documentData.total)} is ready. We'll send you the link shortly.`;
    }
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Handle actual sending logic here
    } catch (error) {
      console.error('Failed to send document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${isMobile ? 'space-y-4' : ''}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Send className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              Send {documentData.type === 'estimate' ? 'Estimate' : 'Invoice'}
            </h2>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              Choose how to deliver the document to your customer
            </p>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* Send Options */}
        <div className="space-y-6">
          {/* Delivery Method */}
          <Card>
            <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
                <Send className="h-5 w-5" />
                Delivery Method
              </CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={documentData.sendVia === 'email' ? 'default' : 'outline'}
                  onClick={() => updateSendMethod('email')}
                  className={`h-auto p-4 flex flex-col gap-2 ${isMobile ? 'h-16' : ''}`}
                  disabled={!clientInfo?.email}
                >
                  <Mail className="h-5 w-5" />
                  <span className={isMobile ? 'text-xs' : 'text-sm'}>Email</span>
                  {!clientInfo?.email && (
                    <span className="text-xs text-muted-foreground">No email</span>
                  )}
                </Button>
                
                <Button
                  variant={documentData.sendVia === 'sms' ? 'default' : 'outline'}
                  onClick={() => updateSendMethod('sms')}
                  className={`h-auto p-4 flex flex-col gap-2 ${isMobile ? 'h-16' : ''}`}
                  disabled={!clientInfo?.phone}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className={isMobile ? 'text-xs' : 'text-sm'}>SMS</span>
                  {!clientInfo?.phone && (
                    <span className="text-xs text-muted-foreground">No phone</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recipient */}
          <Card>
            <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
                {documentData.sendVia === 'email' ? <Mail className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                Send To
              </CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sendTo">
                    {documentData.sendVia === 'email' ? 'Email Address' : 'Phone Number'}
                  </Label>
                  <Input
                    id="sendTo"
                    type={documentData.sendVia === 'email' ? 'email' : 'tel'}
                    placeholder={documentData.sendVia === 'email' ? 'customer@example.com' : '+1 (555) 123-4567'}
                    value={documentData.sendTo}
                    onChange={(e) => updateSendTo(e.target.value)}
                    className={isMobile ? 'h-12 text-base' : ''}
                  />
                </div>
                
                {clientInfo?.name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Sending to: {clientInfo.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
                <MessageSquare className="h-5 w-5" />
                Message
              </CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
              <Textarea
                placeholder={getDefaultMessage()}
                value={documentData.notes || getDefaultMessage()}
                onChange={(e) => updateNotes(e.target.value)}
                rows={documentData.sendVia === 'email' ? 6 : 3}
                className={isMobile ? 'text-base' : ''}
              />
              <p className={`text-xs text-muted-foreground mt-2 ${isMobile ? 'hidden' : ''}`}>
                {documentData.sendVia === 'email' 
                  ? 'This message will be included in the email body'
                  : 'SMS messages should be concise (160 characters recommended)'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Document Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
                <FileText className="h-5 w-5" />
                Document Preview
              </CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
              {/* Document Header */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      {documentData.type === 'estimate' ? 'ESTIMATE' : 'INVOICE'}
                    </h3>
                    <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                      #{documentData.type.toUpperCase()}-{Math.floor(Math.random() * 10000)}
                    </p>
                  </div>
                  <Badge variant={documentData.type === 'estimate' ? 'secondary' : 'default'}>
                    {documentData.type === 'estimate' ? 'Draft' : 'Pending'}
                  </Badge>
                </div>

                {/* Client Info */}
                {clientInfo && (
                  <div className="bg-muted/50 p-3 rounded">
                    <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Bill To:</h4>
                    <p className={isMobile ? 'text-sm' : ''}>{clientInfo.name}</p>
                    {clientInfo.email && <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>{clientInfo.email}</p>}
                    {clientInfo.phone && <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>{clientInfo.phone}</p>}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2">
                  <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Items:</h4>
                  {documentData.items.length === 0 ? (
                    <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>No items selected</p>
                  ) : (
                    <div className="space-y-2">
                      {documentData.items.map((item) => (
                        <div key={item.id} className={`flex justify-between ${isMobile ? 'text-sm' : ''}`}>
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span>
                            {item.isWarranty && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Warranty
                              </Badge>
                            )}
                            <div className="text-muted-foreground text-sm">
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </div>
                          </div>
                          <div className="text-right">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals */}
                {documentData.items.length > 0 && (
                  <div className="space-y-1 pt-4 border-t">
                    <div className={`flex justify-between ${isMobile ? 'text-sm' : ''}`}>
                      <span>Subtotal:</span>
                      <span>{formatCurrency(documentData.subtotal)}</span>
                    </div>
                    <div className={`flex justify-between ${isMobile ? 'text-sm' : ''}`}>
                      <span>Tax (13%):</span>
                      <span>{formatCurrency(documentData.taxAmount)}</span>
                    </div>
                    <div className={`flex justify-between font-bold border-t pt-1 ${isMobile ? 'text-base' : 'text-lg'}`}>
                      <span>Total:</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(documentData.total)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!documentData.sendTo || documentData.items.length === 0 || isLoading}
            className={`w-full ${isMobile ? 'h-12 text-base' : 'h-12'}`}
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send {documentData.type === 'estimate' ? 'Estimate' : 'Invoice'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
