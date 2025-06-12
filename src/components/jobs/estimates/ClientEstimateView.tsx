
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Download, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface EstimateData {
  id: string;
  estimate_number: string;
  total: number;
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  status: string;
  notes: string;
  created_at: string;
  valid_until?: string;
  items: any[]; // JSON array from database
}

interface ClientEstimateViewProps {
  estimateId: string;
  onStatusChange?: (newStatus: string) => void;
}

export const ClientEstimateView = ({ estimateId, onStatusChange }: ClientEstimateViewProps) => {
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchEstimate();
  }, [estimateId]);

  const fetchEstimate = async () => {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (error) throw error;

      // Handle the items field properly
      const estimateData = {
        ...data,
        items: Array.isArray(data.items) ? data.items : []
      };

      setEstimate(estimateData);
    } catch (error) {
      console.error('Error fetching estimate:', error);
      toast.error('Failed to load estimate');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEstimateStatus = async (newStatus: string) => {
    if (!estimate) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('estimates')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'approved' && { approved_at: new Date().toISOString() })
        })
        .eq('id', estimate.id);

      if (error) throw error;

      setEstimate(prev => prev ? { ...prev, status: newStatus } : null);
      onStatusChange?.(newStatus);
      toast.success(`Estimate ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating estimate status:', error);
      toast.error('Failed to update estimate status');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const config = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      converted: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={config[status as keyof typeof config] || config.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!estimate) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-medium mb-2">Estimate not found</h3>
          <p className="text-muted-foreground">
            The estimate you're looking for doesn't exist or you don't have permission to view it.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{estimate.estimate_number}</CardTitle>
              <p className="text-muted-foreground mt-2">
                Created on {new Date(estimate.created_at).toLocaleDateString()}
              </p>
              {estimate.valid_until && (
                <p className="text-sm text-muted-foreground">
                  Valid until {new Date(estimate.valid_until).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              {renderStatusBadge(estimate.status)}
              <div className="text-3xl font-bold mt-2">
                {formatCurrency(estimate.total)}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {estimate.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.description}</div>
                  <div className="text-sm text-muted-foreground">
                    Quantity: {item.quantity} × {formatCurrency(item.unitPrice || item.unit_price || 0)}
                  </div>
                </div>
                <div className="text-right font-medium">
                  {formatCurrency(item.total || (item.quantity * (item.unitPrice || item.unit_price || 0)))}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(estimate.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({(estimate.tax_rate * 100).toFixed(1)}%):</span>
              <span>{formatCurrency(estimate.tax_amount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(estimate.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {estimate.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{estimate.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {estimate.status === 'sent' && (
        <Card>
          <CardHeader>
            <CardTitle>Take Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => updateEstimateStatus('approved')}
                disabled={isUpdating}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Estimate
              </Button>
              <Button
                variant="outline"
                onClick={() => updateEstimateStatus('rejected')}
                disabled={isUpdating}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline Estimate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download */}
      <Card>
        <CardContent className="p-4">
          <Button variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
