
import { useState, useRef, useEffect } from 'react';
import { useClientPortal } from './ClientPortalProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, LogOut, RefreshCw, FileText, CreditCard, Calendar, Activity, Download, Eye } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// 3D Background Component
function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <Box ref={meshRef} args={[2, 2, 2]} position={[4, 0, -5]}>
      <meshStandardMaterial color="#3b82f6" opacity={0.1} transparent />
    </Box>
  );
}

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 3;
      meshRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1]} position={[-4, 2, -3]}>
      <meshStandardMaterial color="#8b5cf6" opacity={0.15} transparent />
    </Sphere>
  );
}

function Scene3D() {
  return (
    <Canvas className="absolute inset-0 pointer-events-none">
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <FloatingGeometry />
      <AnimatedSphere />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}

// Document Card Component
interface DocumentCardProps {
  title: string;
  number: string;
  date: string;
  amount: number;
  status: string;
  type: 'estimate' | 'invoice';
  onView: () => void;
  onDownload?: () => void;
}

function DocumentCard({ title, number, date, amount, status, type, onView, onDownload }: DocumentCardProps) {
  const statusColor = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'paid': 'bg-green-100 text-green-800',
    'unpaid': 'bg-yellow-100 text-yellow-800',
    'overdue': 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800';

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{number}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{title}</p>
          </div>
          <Badge className={statusColor}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              ${amount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onView}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {onDownload && (
              <Button size="sm" variant="outline" onClick={onDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ModernClientPortal() {
  const { session, data, isLoading, isAuthenticated, error, logout, refreshData } = useClientPortal();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
        <Scene3D />
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-12 w-12 animate-ping bg-blue-600 rounded-full opacity-25"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">
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

  if (error || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center relative overflow-hidden">
        <Scene3D />
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {error || 'Unable to authenticate your access. The link may be expired or invalid.'}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/client-portal'} 
                variant="outline"
                className="w-full"
              >
                Return to Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthenticated && session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <Scene3D />
        
        {/* Header */}
        <header className="backdrop-blur-md bg-white/80 border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Welcome back, {session.name}
                  </h1>
                  <p className="text-sm text-gray-600">{session.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={refreshData}
                  variant="outline"
                  size="sm"
                  className="backdrop-blur-sm bg-white/50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="backdrop-blur-sm bg-white/50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 backdrop-blur-md bg-white/60 border-0">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="estimates" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Estimates</span>
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Invoices</span>
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Jobs</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="backdrop-blur-md bg-white/70 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                        <p className="text-3xl font-bold text-blue-600">{data?.jobs?.length || 0}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-white/70 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Estimates</p>
                        <p className="text-3xl font-bold text-green-600">{data?.estimates?.length || 0}</p>
                      </div>
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-white/70 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Outstanding</p>
                        <p className="text-3xl font-bold text-orange-600">
                          ${data?.invoices?.reduce((sum: number, inv: any) => sum + (inv.total - (inv.amount_paid || 0)), 0)?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="backdrop-blur-md bg-white/70 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.activities && data.activities.length > 0 ? (
                    <div className="space-y-4">
                      {data.activities.slice(0, 5).map((activity: any) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/50">
                          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estimates" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Your Estimates</h2>
              </div>
              
              {data?.estimates && data.estimates.length > 0 ? (
                <div className="grid gap-6">
                  {data.estimates.map((estimate: any) => (
                    <DocumentCard
                      key={estimate.id}
                      type="estimate"
                      title={estimate.title || 'Service Estimate'}
                      number={estimate.estimate_number}
                      date={estimate.created_at}
                      amount={estimate.total || 0}
                      status={estimate.status}
                      onView={() => console.log('View estimate', estimate.id)}
                      onDownload={() => console.log('Download estimate', estimate.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="backdrop-blur-md bg-white/70 border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No estimates available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="invoices" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Your Invoices</h2>
              </div>
              
              {data?.invoices && data.invoices.length > 0 ? (
                <div className="grid gap-6">
                  {data.invoices.map((invoice: any) => (
                    <DocumentCard
                      key={invoice.id}
                      type="invoice"
                      title={invoice.title || 'Service Invoice'}
                      number={invoice.invoice_number}
                      date={invoice.created_at}
                      amount={invoice.total || 0}
                      status={invoice.status}
                      onView={() => console.log('View invoice', invoice.id)}
                      onDownload={() => console.log('Download invoice', invoice.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="backdrop-blur-md bg-white/70 border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No invoices available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="jobs" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Your Jobs</h2>
              </div>
              
              {data?.jobs && data.jobs.length > 0 ? (
                <div className="grid gap-6">
                  {data.jobs.map((job: any) => (
                    <Card key={job.id} className="backdrop-blur-md bg-white/70 border-0 shadow-lg border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                          </div>
                          <Badge className={
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {job.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Scheduled Date</p>
                            <p className="font-medium">
                              {job.date ? new Date(job.date).toLocaleDateString() : 'Not scheduled'}
                            </p>
                          </div>
                          {job.revenue && (
                            <div className="text-right">
                              <p className="text-sm text-gray-500 mb-1">Value</p>
                              <p className="text-lg font-bold text-green-600">
                                ${job.revenue.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="backdrop-blur-md bg-white/70 border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No jobs scheduled</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  return null;
}
