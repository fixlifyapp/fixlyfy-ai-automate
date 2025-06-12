
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mail, 
  Phone, 
  Send, 
  FileText, 
  Eye, 
  Check, 
  AlertCircle,
  Download,
  MessageSquare
} from "lucide-react";
import { DocumentType } from "../UnifiedDocumentBuilder";
import { LineItem } from "../../builder/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SendDocumentStepProps {
  documentType: DocumentType;
  documentNumber: string;
  jobData: any;
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  total: number;
  onSave: () => Promise<boolean>;
  onBack: () => void;
  onSuccess: () => void;
}

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+61", country: "Australia", flag: "🇦🇺" }
];

export const SendDocumentStep = ({
  documentType,
  documentNumber,
  jobData,
  lineItems,
  taxRate,
  notes,
  total,
  onSave,
  onBack,
  onSuccess
}: SendDocumentStepProps) => {
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [customMessage, setCustomMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendHistory, setSendHistory] = useState<any[]>([]);
  
  // Validation states
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Load existing contact info if available
  useEffect(() => {
    if (jobData?.client) {
      const client = typeof jobData.client === 'object' ? jobData.client : null;
      if (client?.email) setEmailAddress(client.email);
      if (client?.phone) setPhoneNumber(client.phone);
    }
  }, [jobData]);

  // Load send history
  useEffect(() => {
    loadSendHistory();
  }, [documentNumber]);

  const loadSendHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('document_sends')
        .select('*')
        .eq('document_number', documentNumber)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSendHistory(data);
      }
    } catch (error) {
      console.error('Error loading send history:', error);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email address is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10,15}$/;
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!phone) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (!phoneRegex.test(cleanPhone)) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const generatePDF = async (): Promise<string> => {
    // This would integrate with a PDF generation service
    // For now, return a mock URL
    return `/api/generate-pdf/${documentType}/${documentNumber}`;
  };

  const formatPhoneNumber = (phone: string, country: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `${country}${cleanPhone}`;
  };

  const trackSendEvent = async (method: "email" | "sms", recipient: string, status: "sent" | "failed") => {
    try {
      await supabase
        .from('document_sends')
        .insert({
          document_type: documentType,
          document_number: documentNumber,
          send_method: method,
          recipient: recipient,
          status: status,
          message: customMessage,
          job_id: jobData?.id
        });
    } catch (error) {
      console.error('Error tracking send event:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!validateEmail(emailAddress)) return;

    try {
      setIsSending(true);
      
      // Save document first
      const saveSuccess = await onSave();
      if (!saveSuccess) {
        toast.error("Failed to save document");
        return;
      }

      // Generate PDF
      const pdfUrl = await generatePDF();
      
      // Send via Mailgun
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailAddress,
          subject: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${documentNumber}`,
          template: 'document-send',
          variables: {
            documentType: documentType,
            documentNumber: documentNumber,
            total: formatCurrency(total),
            customMessage: customMessage,
            pdfUrl: pdfUrl,
            clientName: typeof jobData?.client === 'object' ? jobData.client.name : jobData?.client || 'Valued Customer'
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      await trackSendEvent("email", emailAddress, "sent");
      toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent via email successfully!`);
      loadSendHistory();
      onSuccess();
      
    } catch (error: any) {
      console.error('Error sending email:', error);
      await trackSendEvent("email", emailAddress, "failed");
      toast.error(`Failed to send email: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSMS = async () => {
    if (!validatePhone(phoneNumber)) return;

    try {
      setIsSending(true);
      
      // Save document first
      const saveSuccess = await onSave();
      if (!saveSuccess) {
        toast.error("Failed to save document");
        return;
      }

      const fullPhoneNumber = formatPhoneNumber(phoneNumber, countryCode);
      const documentUrl = `${window.location.origin}/view/${documentType}/${documentNumber}`;
      
      const smsMessage = customMessage || 
        `Hi! Your ${documentType} ${documentNumber} is ready. Total: ${formatCurrency(total)}. View: ${documentUrl}`;

      // Send via Telnyx
      const { data, error } = await supabase.functions.invoke('telnyx-sms', {
        body: {
          to: fullPhoneNumber,
          body: smsMessage,
          client_id: jobData?.client_id,
          job_id: jobData?.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      await trackSendEvent("sms", fullPhoneNumber, "sent");
      toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent via SMS successfully!`);
      loadSendHistory();
      onSuccess();
      
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      await trackSendEvent("sms", formatPhoneNumber(phoneNumber, countryCode), "failed");
      toast.error(`Failed to send SMS: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async () => {
    if (sendMethod === "email") {
      await handleSendEmail();
    } else {
      await handleSendSMS();
    }
  };

  const renderDocumentPreview = () => (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Preview
          </h4>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
        </div>
      </CardHeader>
      {showPreview && (
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {documentType.charAt(0).toUpperCase() + documentType.slice(1)} {documentNumber}
              </h3>
              <Badge variant="secondary">{formatCurrency(total)}</Badge>
            </div>
            
            <div className="space-y-2">
              <p><strong>Client:</strong> {typeof jobData?.client === 'object' ? jobData.client.name : jobData?.client || 'Unknown'}</p>
              <p><strong>Items:</strong> {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</p>
              {notes && <p><strong>Notes:</strong> {notes}</p>}
            </div>

            <div className="mt-4 space-y-1">
              {lineItems.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.description}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
              ))}
              {lineItems.length > 3 && (
                <p className="text-sm text-muted-foreground">...and {lineItems.length - 3} more items</p>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  const renderSendHistory = () => (
    <Card className="mt-4">
      <CardHeader>
        <h4 className="font-semibold">Send History</h4>
      </CardHeader>
      <CardContent>
        {sendHistory.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sends recorded yet</p>
        ) : (
          <div className="space-y-2">
            {sendHistory.slice(0, 5).map((send, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {send.send_method === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                  <span className="text-sm">{send.recipient}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={send.status === "sent" ? "default" : "destructive"} className="text-xs">
                    {send.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(send.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Send Document</h3>
        <p className="text-muted-foreground">
          Send {documentType} {documentNumber} to your client
        </p>
      </div>

      {/* Send Method Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <Mail className={`h-5 w-5 ${sendMethod === "email" ? "text-primary" : "text-muted-foreground"}`} />
              <Label htmlFor="email-toggle">Email</Label>
              <Switch
                id="email-toggle"
                checked={sendMethod === "email"}
                onCheckedChange={(checked) => setSendMethod(checked ? "email" : "sms")}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={sendMethod === "sms"}
                onCheckedChange={(checked) => setSendMethod(checked ? "sms" : "email")}
              />
              <Label htmlFor="sms-toggle">SMS</Label>
              <Phone className={`h-5 w-5 ${sendMethod === "sms" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <h4 className="font-semibold">Contact Information</h4>
        </CardHeader>
        <CardContent className="space-y-4">
          {sendMethod === "email" ? (
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                onBlur={() => validateEmail(emailAddress)}
                placeholder="client@example.com"
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {emailError}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onBlur={() => validatePhone(phoneNumber)}
                  placeholder="(555) 123-4567"
                  className={`flex-1 ${phoneError ? "border-red-500" : ""}`}
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {phoneError}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <h4 className="font-semibold">Custom Message (Optional)</h4>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={`Add a personal note for your ${documentType}...`}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {sendMethod === "sms" ? "SMS character count: " + customMessage.length + "/160" : "Email message will be included in the email body"}
          </p>
        </CardContent>
      </Card>

      {/* Document Preview */}
      {renderDocumentPreview()}

      {/* Send History */}
      {renderSendHistory()}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSend}
            disabled={isSending || (sendMethod === "email" ? !emailAddress || !!emailError : !phoneNumber || !!phoneError)}
          >
            {isSending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send {sendMethod === "email" ? "Email" : "SMS"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
