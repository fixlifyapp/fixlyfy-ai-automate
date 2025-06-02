import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Mail, Globe, Copy } from 'lucide-react';
import { useCompanyEmailSettings } from '@/hooks/useCompanyEmailSettings';
import { MailgunTestPanel } from '@/components/connect/MailgunTestPanel';
import { toast } from 'sonner';

export const CompanyEmailSettings = () => {
  const { settings, loading, saving, addDomain, verifyDomain, updateEmailSettings } = useCompanyEmailSettings();
  const [newDomain, setNewDomain] = useState('');
  const [dnsRecords, setDnsRecords] = useState<any[]>([]);

  const handleAddDomain = async () => {
    if (!newDomain) {
      toast.error('Please enter a domain name');
      return;
    }

    try {
      const result = await addDomain(newDomain);
      setDnsRecords(result.dns_records || []);
      setNewDomain('');
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
          Set up custom email domains to send emails from your own domain (e.g., noreply@yourcompany.com)
        </p>
      </div>

      {/* Domain Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Domain Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!settings.custom_domain ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="domain"
                    placeholder="yourcompany.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                  />
                  <Button onClick={handleAddDomain} disabled={saving}>
                    {saving ? 'Adding...' : 'Add Domain'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your domain name (without http:// or www)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{settings.custom_domain}</div>
                  <div className="text-sm text-muted-foreground">
                    Email from: {settings.email_from_address}
                  </div>
                </div>
                {getStatusBadge(settings.domain_verification_status)}
              </div>

              {settings.domain_verification_status !== 'verified' && (
                <div className="space-y-4">
                  <Button onClick={handleVerifyDomain} disabled={saving}>
                    {saving ? 'Verifying...' : 'Verify Domain'}
                  </Button>
                  
                  {dnsRecords.length > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-md">
                      <h4 className="font-medium mb-2">Required DNS Records</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add these DNS records to your domain registrar:
                      </p>
                      <div className="space-y-2">
                        {dnsRecords.map((record, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div>
                                <strong>Type:</strong> {record.record_type}
                              </div>
                              <div>
                                <strong>Name:</strong> {record.name}
                              </div>
                              <div className="col-span-2 flex items-center gap-2">
                                <strong>Value:</strong> 
                                <code className="bg-gray-100 px-1 rounded text-xs flex-1">
                                  {record.value}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(record.value)}
                                >
                                  <Copy size={12} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  placeholder={`noreply@${settings.custom_domain}`}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Email templates management will be available once your domain is verified.
          </p>
          {settings.domain_verification_status === 'verified' && (
            <Button variant="outline" className="mt-4">
              Manage Templates
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
