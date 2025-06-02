
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Mail, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const MailgunConfig = () => {
  const [domain, setDomain] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [fromName, setFromName] = useState("Support Team");
  const [fromAddress, setFromAddress] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMailgunSettings();
  }, []);

  const loadMailgunSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('mailgun_domain, email_from_name, email_from_address, domain_verification_status')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setDomain(data.mailgun_domain || "");
        setFromName(data.email_from_name || "Support Team");
        setFromAddress(data.email_from_address || "");
        setVerificationStatus(data.domain_verification_status || "pending");
      }
    } catch (error) {
      console.error('Error loading Mailgun settings:', error);
      toast.error('Failed to load Mailgun settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Update company settings
      const { error: settingsError } = await supabase
        .from('company_settings')
        .upsert({
          mailgun_domain: domain,
          email_from_name: fromName,
          email_from_address: fromAddress,
          domain_verification_status: 'pending'
        });

      if (settingsError) throw settingsError;

      toast.success('Mailgun settings saved successfully');
      
      // If domain is provided, trigger verification
      if (domain) {
        await verifyDomain();
      }
    } catch (error) {
      console.error('Error saving Mailgun settings:', error);
      toast.error('Failed to save Mailgun settings');
    } finally {
      setIsSaving(false);
    }
  };

  const verifyDomain = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-mailgun-domains', {
        body: {
          action: 'verify',
          domain: domain
        }
      });

      if (error) throw error;

      if (data?.verified) {
        setVerificationStatus('verified');
        toast.success('Domain verified successfully!');
      } else {
        setVerificationStatus('pending');
        toast.info('Domain verification is pending. Please check your DNS settings.');
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast.error('Failed to verify domain');
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Mailgun Email Configuration
        </CardTitle>
        <CardDescription>
          Configure Mailgun for sending emails like estimates and invoices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="domain">Mailgun Domain</Label>
            <div className="flex gap-2">
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="mg.yourdomain.com"
                disabled={isLoading}
              />
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your verified Mailgun domain
            </p>
          </div>

          <div>
            <Label htmlFor="fromName">From Name</Label>
            <Input
              id="fromName"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Support Team"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="fromAddress">From Email Address</Label>
          <Input
            id="fromAddress"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            placeholder="support@yourdomain.com"
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground mt-1">
            This should match your Mailgun domain
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={saveSettings} 
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
          
          {domain && verificationStatus !== 'verified' && (
            <Button 
              variant="outline" 
              onClick={verifyDomain}
              disabled={isLoading}
            >
              Verify Domain
            </Button>
          )}

          <Button variant="outline" asChild>
            <a href="https://app.mailgun.com/mg/domains" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Mailgun Dashboard
            </a>
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Setup Instructions:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Create a Mailgun account and add your domain</li>
            <li>Configure DNS records as shown in Mailgun dashboard</li>
            <li>Add your Mailgun API key in the secrets section</li>
            <li>Enter your domain and email settings above</li>
            <li>Click "Verify Domain" to complete setup</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
