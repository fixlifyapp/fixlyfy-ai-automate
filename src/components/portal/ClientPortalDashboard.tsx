
import { useEffect } from 'react';
import { useClientPortal } from './ClientPortalProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ClientPortalDashboard() {
  const { session, data, isLoading, isAuthenticated, error, logout, refreshData } = useClientPortal();

  useEffect(() => {
    console.log('📊 ClientPortalDashboard render state:', {
      isLoading,
      isAuthenticated,
      hasSession: !!session,
      hasData: !!data,
      error
    });
  }, [isLoading, isAuthenticated, session, data, error]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Authenticating...
            </h3>
            <p className="text-gray-600 text-center">
              Please wait while we verify your access
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-bold text-gray-900">
              Authentication Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {error || 'Unable to authenticate your access. The link may be expired or invalid.'}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/client-portal'} 
                className="w-full"
              >
                Return to Portal
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-4">
              <p>Debug Info:</p>
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Session: {session ? 'Present' : 'Missing'}</p>
              <p>Data: {data ? 'Loaded' : 'Not loaded'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show dashboard if authenticated and data is loaded
  if (isAuthenticated && session) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome, {session.name}
                </h1>
                <p className="text-sm text-gray-600">{session.email}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={refreshData}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {data ? (
            <div className="grid gap-6">
              {/* Client Info */}
              {data.client && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-lg">{data.client.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-lg">{data.client.email}</p>
                      </div>
                      {data.client.phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-lg">{data.client.phone}</p>
                        </div>
                      )}
                      {data.client.address && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Address</p>
                          <p className="text-lg">{data.client.address}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Jobs */}
              {data.jobs && data.jobs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.jobs.slice(0, 5).map((job: any) => (
                        <div key={job.id} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {job.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(job.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Estimates */}
              {data.estimates && data.estimates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Estimates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.estimates.slice(0, 5).map((estimate: any) => (
                        <div key={estimate.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Estimate #{estimate.document_number}</h4>
                            <p className="text-sm text-gray-600">
                              Created: {new Date(estimate.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              ${(estimate.total || 0).toFixed(2)}
                            </p>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {estimate.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Invoices */}
              {data.invoices && data.invoices.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.invoices.slice(0, 5).map((invoice: any) => (
                        <div key={invoice.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Invoice #{invoice.document_number}</h4>
                            <p className="text-sm text-gray-600">
                              Created: {new Date(invoice.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              ${(invoice.total || 0).toFixed(2)}
                            </p>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Loading Your Data...
                </h3>
                <p className="text-gray-600 text-center">
                  Please wait while we fetch your information
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  // Fallback state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-8 w-8 text-yellow-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unexpected State
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Something unexpected happened. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
