
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle, AlertCircle, Globe, Info, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCompanyEmailSettings } from '@/hooks/useCompanyEmailSettings';

export const MailgunTestPanel = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { settings } = useCompanyEmailSettings();
  
  const [formData, setFormData] = useState({
    to: '',
    subject: 'Test Email from Fixlyfy',
    text: 'This is a test email sent via Mailgun integration to verify your email configuration is working properly.',
    html: '<h1>Test Email</h1><p>This is a test email sent via <strong>Mailgun integration</strong> to verify your email configuration is working properly.</p><p>If you received this email, your setup is working correctly!</p>'
  });

  const sendTestEmail = async () => {
    if (!formData.to) {
      toast.error('Please enter a recipient email address');
      return;
    }

    setLoading(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: formData.to,
          subject: formData.subject,
          text: formData.text,
          html: formData.html
        }
      });

      if (error) throw error;

      setTestResult(data);
      toast.success('Test email sent successfully!');
    } catch (error: any) {
      console.error('Error sending test email:', error);
      setTestResult({ error: error.message });
      toast.error('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const isCustomDomainVerified = settings.domain_verification_status === 'verified';
  const hasCustomDomain = Boolean(settings.custom_domain);

  return (
    <div className="space-y-4">
      {/* Domain Status Info */}
      <div className="p-4 border rounded-lg">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 mt-0.5 text-blue-600" />
          <div className="flex-1">
            <h4 className="font-medium">Email Domain Status</h4>
            {!hasCustomDomain ? (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  No custom domain configured. Currently using Mailgun sandbox.
                </p>
                <Badge variant="secondary">Sandbox Mode</Badge>
                <p className="text-xs text-amber-600 mt-1">
                  Sandbox mode only allows sending to authorized recipients
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Domain: <strong>{settings.custom_domain}@fixlyfy.app</strong>
                </p>
                <div className="flex items-center gap-2">
                  {isCustomDomainVerified ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified & Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pending Verification
                    </Badge>
                  )}
                </div>
                {!isCustomDomainVerified && (
                  <p className="text-xs text-amber-600 mt-1">
                    Complete domain verification in the settings above to send to any email address
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="test-to">To Email *</Label>
          <Input
            id="test-to"
            value={formData.to}
            onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
            placeholder="your-email@example.com"
            type="email"
          />
          <p className="text-xs text-muted-foreground">
            {isCustomDomainVerified 
              ? 'Enter any valid email address' 
              : 'Enter only authorized recipient emails (limited in sandbox/unverified mode)'
            }
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test-subject">Subject</Label>
          <Input
            id="test-subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Test Subject"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="test-text">Text Content</Label>
        <Textarea
          id="test-text"
          value={formData.text}
          onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
          placeholder="Plain text content..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="test-html">HTML Content</Label>
        <Textarea
          id="test-html"
          value={formData.html}
          onChange={(e) => setFormData(prev => ({ ...prev, html: e.target.value }))}
          placeholder="<h1>HTML content...</h1>"
          rows={3}
        />
      </div>

      <Button onClick={sendTestEmail} disabled={loading || !formData.to} className="w-full">
        <Send className="h-4 w-4 mr-2" />
        {loading ? 'Sending Test Email...' : 'Send Test Email'}
      </Button>

      {/* Test Result Display */}
      {testResult && (
        <div className="mt-4 p-4 rounded-lg border">
          {testResult.error ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error:</span>
              </div>
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {testResult.error}
              </div>
              {testResult.error.includes('sandbox') && (
                <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded">
                  <p className="font-medium mb-2">Sandbox Limitations:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Add your custom domain in the settings above</li>
                    <li>Complete DNS verification</li>
                    <li>Or add authorized recipients in your Mailgun dashboard</li>
                  </ol>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <a href="https://app.mailgun.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open Mailgun Dashboard
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Email sent successfully!</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Message ID:</span> 
                  <code className="bg-gray-100 px-1 rounded text-xs ml-1">{testResult.messageId}</code>
                </div>
                <div>
                  <span className="font-medium">From:</span> 
                  <code className="bg-gray-100 px-1 rounded text-xs ml-1">{testResult.from}</code>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Domain:</span> 
                  <code className="bg-gray-100 px-1 rounded text-xs ml-1">{testResult.domain}</code>
                  {testResult.isCustomDomain && (
                    <Badge variant="default" className="ml-2">
                      <Globe className="h-3 w-3 mr-1" />
                      Custom Domain
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
