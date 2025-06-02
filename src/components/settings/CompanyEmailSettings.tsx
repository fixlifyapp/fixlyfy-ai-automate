
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Mail, Globe, Copy, Info } from 'lucide-react';
import { useCompanyEmailSettings } from '@/hooks/useCompanyEmailSettings';
import { MailgunTestPanel } from '@/components/connect/MailgunTestPanel';
import { toast } from 'sonner';

export const CompanyEmailSettings = () => {
  const { settings, loading, saving, addDomain, verifyDomain, updateEmailSettings } = useCompanyEmailSettings();
  const [newDomain, setNewDomain] = useState('');
  const [dnsRecords, setDnsRecords] = useState<any[]>([]);

  const handleAddDomain = async () => {
    if (!newDomain) {
      toast.error('Please enter a company name');
      return;
    }

    // Validate company name (letters, numbers, hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(newDomain)) {
      toast.error('Company name can only contain letters, numbers, and hyphens');
      return;
    }

    try {
      const result = await addDomain(newDomain);
      setDnsRecords(result.dns_records || []);
      setNewDomain('');
      toast.success(`Domain ${newDomain}@fixlyfy.app has been configured!`);
    } catch (error) {
      // Error handling in hook
    }
  };

  const handleVerifyDomain = async () => {
    if (!settings.custom_domain) return;

    try {
      await verifyDomain(settings.custom_domain);
    } catch (error) {
      // Error handling in hook
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle size={14} className="mr-1" />Verified</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle size={14} className="mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle size={14} className="mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return <div>Loading email settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Configuration
        </h3>
        <p className="text-muted-foreground">
          Configure your company email domain to send professional emails from your own domain
        </p>
      </div>

      {/* Domain Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Email Domain Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!settings.custom_domain ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">How Email Domains Work</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Set up your company email to send from <strong>yourcompany@fixlyfy.app</strong>
                    </p>
                    <p className="text-sm text-blue-700">
                      Example: If you enter "acmeplumbing", emails will be sent from <strong>acmeplumbing@fixlyfy.app</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Company Name</Label>
                <div className="flex gap-2">
                  <div className="flex-1 flex">
                    <Input
                      id="domain"
                      placeholder="yourcompany"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-100 border border-l-0 px-3 py-2 rounded-r-md text-sm text-gray-600 flex items-center">
                      @fixlyfy.app
                    </div>
                  </div>
                  <Button onClick={handleAddDomain} disabled={saving || !newDomain}>
                    {saving ? 'Setting up...' : 'Setup Domain'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your company name (letters, numbers, and hyphens only)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-lg">{settings.custom_domain}@fixlyfy.app</div>
                  <div className="text-sm text-muted-foreground">
                    Email from: {settings.email_from_address || `noreply@${settings.custom_domain}.fixlyfy.app`}
                  </div>
                </div>
                {getStatusBadge(settings.domain_verification_status)}
              </div>

              {settings.domain_verification_status !== 'verified' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <strong>Almost ready!</strong> Click verify to activate your custom domain. This is a demo environment, so verification will complete immediately.
                    </p>
                  </div>
                  
                  <Button onClick={handleVerifyDomain} disabled={saving}>
                    {saving ? 'Verifying...' : 'Verify Domain'}
                  </Button>
                </div>
              )}

              {settings.domain_verification_status === 'verified' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Domain verified successfully!</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    You can now send emails from your custom domain to any email address.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input
                id="from-name"
                value={settings.email_from_name || ''}
                onChange={(e) => updateEmailSettings({ email_from_name: e.target.value })}
                placeholder="Support Team"
              />
            </div>
            
            {settings.domain_verification_status === 'verified' && (
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input
                  id="from-email"
                  value={settings.email_from_address || ''}
                  onChange={(e) => updateEmailSettings({ email_from_address: e.target.value })}
                  placeholder={`noreply@${settings.custom_domain}.fixlyfy.app`}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Test Email Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <MailgunTestPanel />
        </CardContent>
      </Card>
    </div>
  );
};
