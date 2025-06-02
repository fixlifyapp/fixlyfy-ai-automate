
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const MailgunTestPanel = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    to: 'contact@fixlify.app',
    subject: 'Mailgun Test Email',
    text: 'This is a test email sent via Mailgun API integration!',
    html: '<h1>Test Email</h1><p>This is a test email sent via <strong>Mailgun API</strong> integration!</p>'
  });

  const sendTestEmail = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: formData.to,
          subject: formData.subject,
          text: formData.text,
          html: formData.html,
          from: 'Mailgun Sandbox <postmaster@sandbox79a9a7a7640e4819b2c0a73e5e68e825.mailgun.org>'
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Mailgun Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="test-to">To Email</Label>
            <Input
              id="test-to"
              value={formData.to}
              onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
              placeholder="recipient@example.com"
            />
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

        <Button onClick={sendTestEmail} disabled={loading} className="w-full">
          {loading ? 'Sending...' : 'Send Test Email'}
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
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Email sent successfully!</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Message ID:</span> {testResult.messageId}
                  </div>
                  <div>
                    <span className="font-medium">From:</span> {testResult.from}
                  </div>
                  <div>
                    <span className="font-medium">Domain:</span> {testResult.domain}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge variant="default">Sent</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground p-3 bg-gray-50 rounded">
          <p className="font-medium mb-1">Using Mailgun Sandbox:</p>
          <p>Domain: sandbox79a9a7a7640e4819b2c0a73e5e68e825.mailgun.org</p>
          <p>Note: Sandbox domains can only send to authorized recipients.</p>
        </div>
      </CardContent>
    </Card>
  );
};
