
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const MailgunTestPanel = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
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

  return (
    <div className="space-y-4">
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
            Enter any valid email address to test delivery
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

      {testResult && (
        <div className="mt-4 p-4 rounded-lg border">
          {testResult.error ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error:</span>
              <span>{testResult.error}</span>
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

      <div className="text-xs text-muted-foreground p-3 bg-blue-50 rounded">
        <p className="font-medium mb-1">📧 Email Testing Info:</p>
        <p>• If you have a verified custom domain, emails will be sent from your domain</p>
        <p>• Otherwise, emails will be sent from the Mailgun sandbox domain</p>
        <p>• Sandbox domains can only send to authorized recipients (usually the account owner)</p>
        <p>• Custom domains can send to any email address</p>
      </div>
    </div>
  );
};
