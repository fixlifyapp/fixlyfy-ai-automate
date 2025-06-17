
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, Mail, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratePortalLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
}

export const GeneratePortalLinkDialog = ({
  open,
  onOpenChange,
  clientId,
  clientName,
  clientEmail,
  clientPhone
}: GeneratePortalLinkDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [portalLink, setPortalLink] = useState<string>("");
  const [sendMethod, setSendMethod] = useState<"copy" | "email" | "sms">("copy");
  const [customMessage, setCustomMessage] = useState("");

  const generatePortalLink = async () => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-portal-link', {
        body: {
          clientId,
          validHours: 72 // 3 days
        }
      });

      if (error) throw error;
      
      if (data?.accessLink) {
        const fullLink = `${window.location.origin}/portal/${data.accessLink}`;
        setPortalLink(fullLink);
        toast.success('Portal link generated successfully!');
      }
    } catch (err: any) {
      console.error('Generate portal link error:', err);
      toast.error('Failed to generate portal link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(portalLink);
    toast.success('Link copied to clipboard!');
  };

  const sendPortalLink = async () => {
    if (!portalLink) return;

    try {
      const message = customMessage || `Hi ${clientName}! Access your client portal here: ${portalLink}`;

      if (sendMethod === "email" && clientEmail) {
        const { error } = await supabase.functions.invoke('send-portal-link', {
          body: {
            method: 'email',
            recipient: clientEmail,
            message,
            clientName,
            portalLink
          }
        });
        
        if (error) throw error;
        toast.success('Portal link sent via email!');
      } else if (sendMethod === "sms" && clientPhone) {
        const { error } = await supabase.functions.invoke('send-portal-link', {
          body: {
            method: 'sms',
            recipient: clientPhone,
            message,
            clientName,
            portalLink
          }
        });
        
        if (error) throw error;
        toast.success('Portal link sent via SMS!');
      }
      
      onOpenChange(false);
    } catch (err: any) {
      console.error('Send portal link error:', err);
      toast.error('Failed to send portal link');
    }
  };

  const openPortalLink = () => {
    if (portalLink) {
      window.open(portalLink, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Client Portal Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            Generate a secure access link for <strong>{clientName}</strong> to view their estimates and invoices.
          </div>

          {!portalLink ? (
            <Button 
              onClick={generatePortalLink}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Portal Link"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <Input 
                    value={portalLink} 
                    readOnly 
                    className="text-xs"
                  />
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={openPortalLink}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Send Method</Label>
                <RadioGroup value={sendMethod} onValueChange={(value: any) => setSendMethod(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="copy" id="copy" />
                    <Label htmlFor="copy">Copy to clipboard only</Label>
                  </div>
                  
                  {clientEmail && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Send via Email ({clientEmail})
                      </Label>
                    </div>
                  )}
                  
                  {clientPhone && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sms" id="sms" />
                      <Label htmlFor="sms" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Send via SMS ({clientPhone})
                      </Label>
                    </div>
                  )}
                </RadioGroup>
              </div>

              {(sendMethod === "email" || sendMethod === "sms") && (
                <div className="space-y-2">
                  <Label>Custom Message (optional)</Label>
                  <Input
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder={`Hi ${clientName}! Access your client portal here: ${portalLink}`}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancel
                </Button>
                {sendMethod !== "copy" ? (
                  <Button onClick={sendPortalLink} className="flex-1">
                    Send Link
                  </Button>
                ) : (
                  <Button onClick={copyToClipboard} className="flex-1">
                    Copy Link
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
