
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Mail, MessageSquare } from 'lucide-react';

export function ClientPortalLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Client Portal Access</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-blue-500" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Access Link Required
            </h3>
            <p className="text-gray-600">
              To access your client portal, you need a secure access link. This link is sent to you via:
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-700">Email notifications</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">SMS text messages</span>
            </div>
          </div>

          <div className="text-sm text-gray-500 space-y-2">
            <p>
              These secure links are sent when you receive estimates, invoices, or other important documents.
            </p>
            <p>
              If you haven't received an access link or need assistance, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
