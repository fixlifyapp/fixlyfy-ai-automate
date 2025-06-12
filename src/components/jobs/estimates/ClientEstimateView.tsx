
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Product } from '../builder/types';

interface ClientEstimateViewProps {
  estimateId: string;
  onStatusChange?: (status: string) => void;
}

interface EstimateData {
  id: string;
  estimate_number: string;
  total: number;
  status: string;
  notes?: string;
  items: any[];
  created_at: string;
  valid_until?: string;
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
      setEstimate(data);
    } catch (error) {
      console.error('Error fetching estimate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!estimate) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('estimates')
        .update({ 
          status: newStatus,
          ...(newStatus === 'approved' && { approved_at: new Date().toISOString() })
        })
        .eq('id', estimate.id);

      if (error) throw error;

      setEstimate({ ...estimate, status: newStatus });
      onStatusChange?.(newStatus);
    } catch (error) {
      console.error('Error updating estimate status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const config = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      converted: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle }
    };

    const { color, icon: Icon } = config[status as keyof typeof config] || config.draft;

    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Parse line items from JSON
  const parseLineItems = (items: any[]): Product[] => {
    if (!Array.isArray(items)) return [];
    
    return items.map((item, index) => ({
      id: item.id || `item-${index}`,
      name: item.name || item.description || 'Service Item',
      price: Number(item.price || item.unitPrice || 0),
      description: item.description || '',
      ourprice: Number(item.ourprice || item.ourPrice || item.cost || 0),
      quantity: Number(item.quantity || 1),
      unit: item.unit || 'each',
      taxable: Boolean(item.taxable),
      category: item.category || ''
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!estimate) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Estimate not found</p>
        </CardContent>
      </Card>
    );
  }

  const lineItems = parseLineItems(estimate.items || []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{estimate.estimate_number}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created {new Date(estimate.created_at).toLocaleDateString()}
              </p>
              {estimate.valid_until && (
                <p className="text-sm text-muted-foreground">
                  Valid until {new Date(estimate.valid_until).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-right">
              {renderStatusBadge(estimate.status)}
              <div className="text-2xl font-bold mt-2">
                {formatCurrency(estimate.total)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {estimate.notes && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {estimate.notes}
              </p>
            </div>
          )}

          {lineItems.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-4">Items & Services</h3>
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency((item.quantity || 1) * item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {estimate.status === 'sent' && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => updateStatus('approved')}
                disabled={isUpdating}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Estimate
              </Button>
              <Button
                variant="outline"
                onClick={() => updateStatus('rejected')}
                disabled={isUpdating}
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Decline Estimate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
