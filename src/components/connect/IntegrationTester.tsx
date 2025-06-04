
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Phone, Mail, MessageSquare, Send, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const IntegrationTester = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testPhone, setTestPhone] = useState('+14377476737');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testMessage, setTestMessage] = useState('Test message from integration tester');

  const updateResult = (name: string, status: 'success' | 'error', message: string, details?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        return [...prev];
      }
      return [...prev, { name, status, message, details }];
    });
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    // Test 1: Database Connectivity
    try {
      const { data, error } = await supabase.from('conversations').select('count').limit(1);
      if (error) throw error;
      updateResult('Database Connection', 'success', 'Successfully connected to database');
    } catch (error) {
      updateResult('Database Connection', 'error', `Database error: ${error.message}`);
    }

    // Test 2: Telnyx SMS Configuration
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'get_config' }
      });
      
      if (error) throw error;
      
      if (data?.config?.api_key_configured) {
        updateResult('Telnyx Configuration', 'success', 'Telnyx API key is configured');
      } else {
        updateResult('Telnyx Configuration', 'error', 'Telnyx API key not configured');
      }
    } catch (error) {
      updateResult('Telnyx Configuration', 'error', `Telnyx config error: ${error.message}`);
    }

    // Test 3: Company Settings for SMS
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('company_phone')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data?.company_phone) {
        updateResult('Company Phone', 'success', `Company phone configured: ${data.company_phone}`);
      } else {
        updateResult('Company Phone', 'error', 'Company phone not configured in settings');
      }
    } catch (error) {
      updateResult('Company Phone', 'error', `Company settings error: ${error.message}`);
    }

    // Test 4: Test SMS Sending
    if (testPhone && testMessage) {
      try {
        const { data, error } = await supabase.functions.invoke('telnyx-sms', {
          body: {
            to: testPhone,
            body: `[TEST] ${testMessage}`,
            client_id: 'test-client',
            job_id: 'test-job'
          }
        });
        
        if (error) throw error;
        
        if (data?.success) {
          updateResult('SMS Sending', 'success', 'SMS sent successfully via Telnyx');
        } else {
          updateResult('SMS Sending', 'error', `SMS sending failed: ${data?.error || 'Unknown error'}`);
        }
      } catch (error) {
        updateResult('SMS Sending', 'error', `SMS sending error: ${error.message}`);
      }
    }

    // Test 5: Email Sending
    if (testEmail && testMessage) {
      try {
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            to: testEmail,
            subject: '[TEST] Integration Test Email',
            text: `Test email: ${testMessage}`,
            html: `<p>Test email: ${testMessage}</p>`,
            useSandbox: true
          }
        });
        
        if (error) throw error;
        
        if (data?.success) {
          updateResult('Email Sending', 'success', 'Email sent successfully via Mailgun');
        } else {
          updateResult('Email Sending', 'error', `Email sending failed: ${data?.error || 'Unknown error'}`);
        }
      } catch (error) {
        updateResult('Email Sending', 'error', `Email sending error: ${error.message}`);
      }
    }

    // Test 6: Message Context Functionality
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          clients:client_id(id, name, phone, email),
          messages(id, body, direction, created_at)
        `)
        .limit(5);
      
      if (error) throw error;
      
      updateResult('Message Context', 'success', `Found ${conversations?.length || 0} conversations in database`);
    } catch (error) {
      updateResult('Message Context', 'error', `Message context error: ${error.message}`);
    }

    // Test 7: Webhook Endpoints Status
    try {
      // Test if webhook functions exist
      const webhookTests = [
        'telnyx-sms-webhook',
        'mailgun-webhook'
      ];
      
      for (const webhook of webhookTests) {
        try {
          // Just test that the webhook responds (even with error is fine)
          const response = await fetch(`https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/${webhook}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true })
          });
          
          updateResult(`${webhook} Endpoint`, 'success', `Webhook endpoint is accessible`);
        } catch (error) {
          updateResult(`${webhook} Endpoint`, 'error', `Webhook not accessible: ${error.message}`);
        }
      }
    } catch (error) {
      updateResult('Webhook Endpoints', 'error', `Webhook test error: ${error.message}`);
    }

    setIsRunning(false);
    toast.success('Integration tests completed');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Integration Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Test Phone Number</label>
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Test Email</label>
              <Input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                type="email"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Test Message</label>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter test message content"
              rows={3}
            />
          </div>

          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="w-full gap-2"
          >
            {isRunning ? (
              <>
                <TestTube className="h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Run All Integration Tests
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                      {result.details && (
                        <details className="mt-1">
                          <summary className="text-xs cursor-pointer">View Details</summary>
                          <pre className="text-xs mt-1 p-2 bg-gray-100 rounded">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
