
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const PortalEstimatesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to main app since client portal login is no longer available
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Client Portal Access</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The client portal system has been updated. You'll now receive direct secure links via email or SMS to view your documents. No login required!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortalEstimatesPage;
