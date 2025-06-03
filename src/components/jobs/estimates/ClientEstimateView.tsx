
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Phone, Mail, MapPin, Calendar, FileText } from "lucide-react";
import { UpsellDialog } from "../dialogs/UpsellDialog";
import { supabase } from "@/integrations/supabase/client";
import { useEstimateUpsell } from "./hooks/useEstimateUpsell";
import { Product } from "../builder/types";
import { toast } from "sonner";

interface ClientEstimateViewProps {
  estimateId: string;
  clientId?: string;
}

interface EstimateData {
  id: string;
  estimate_number: string;
  total: number;
  status: string;
  notes?: string;
  job_id: string;
  created_at: string;
  techniciansNote?: string;
  viewed?: boolean;
}

interface JobData {
  id: string;
  title: string;
  description: string;
  service: string;
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
}

interface LineItemData {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

export const ClientEstimateView = ({ estimateId, clientId }: ClientEstimateViewProps) => {
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [lineItems, setLineItems] = useState<LineItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);
  const [recommendedWarranty, setRecommendedWarranty] = useState<Product | null>(null);

  const { state, actions } = useEstimateUpsell([estimate as any], () => {});

  useEffect(() => {
    fetchEstimateData();
  }, [estimateId]);

  const fetchEstimateData = async () => {
    try {
      // Fetch estimate data
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (estimateError) throw estimateError;

      // Fetch job and client data
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', estimateData.job_id)
        .single();

      if (jobError) throw jobError;

      // Fetch line items
      const { data: itemsData, error: itemsError } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', estimateId)
        .eq('parent_type', 'estimate');

      if (itemsError) throw itemsError;

      setEstimate({
        ...estimateData,
        viewed: estimateData.status !== 'draft',
        techniciansNote: estimateData.notes?.includes('Recommended:') ? estimateData.notes : undefined
      });
      setJob(jobData);
      setLineItems(itemsData || []);

      // Check if we should show upsell (first time viewing with warranty recommendation)
      const hasWarrantyRecommendation = estimateData.notes?.includes('Recommended:') || false;
      const isFirstView = estimateData.status === 'draft';
      
      if (hasWarrantyRecommendation && isFirstView) {
        // Create a recommended warranty from the technician's note
        const recommendedWarranty: Product = {
          id: `warranty-${Date.now()}`,
          name: "Extended Service Warranty",
          description: "Complete protection for your system with priority service response",
          price: 149.99,
          category: "Warranties",
          taxable: false,
          cost: 50,
          ourPrice: 75,
          sku: "WAR-EXT-001",
          tags: ["warranty", "protection"]
        };
        
        setRecommendedWarranty(recommendedWarranty);
        setShowUpsell(true);

        // Mark estimate as viewed
        await supabase
          .from('estimates')
          .update({ status: 'viewed' })
          .eq('id', estimateId);
      }

    } catch (error: any) {
      console.error('Error fetching estimate data:', error);
      toast.error('Failed to load estimate details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpsellAccept = (warranty: Product) => {
    toast.success(`Thank you! We'll contact you about adding ${warranty.name} to your service.`);
    setShowUpsell(false);
    
    // In a real implementation, this would trigger a notification to the technician
    // or automatically add the warranty to the estimate
  };

  const handleUpsellDecline = () => {
    setShowUpsell(false);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.13; // 13% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'draft': 'bg-gray-100 text-gray-800',
      'viewed': 'bg-blue-100 text-blue-800',
      'sent': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!estimate || !job) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Estimate Not Found</h2>
            <p className="text-gray-600">The estimate you're looking for could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-6 w-6" />
                  Estimate {estimate.estimate_number}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Created on {new Date(estimate.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(estimate.status)}
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {formatCurrency(estimate.total)}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Job & Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium">{job.title}</h4>
                <p className="text-sm text-muted-foreground">{job.service}</p>
              </div>
              {job.description && (
                <div>
                  <h5 className="font-medium text-sm">Description:</h5>
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Service Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{job.client.name}</p>
              <p className="text-sm text-muted-foreground">
                {job.client.address}<br />
                {job.client.city}, {job.client.state} {job.client.zip}
              </p>
              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-1 text-sm">
                  <Phone className="h-4 w-4" />
                  {job.client.phone}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Mail className="h-4 w-4" />
                  {job.client.email}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Service Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.description}</h4>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.quantity * item.unit_price)}</p>
                    {item.taxable && <p className="text-xs text-muted-foreground">+ tax</p>}
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (13%):</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {estimate.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{estimate.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Contact Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Questions about this estimate?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our team is here to help. Contact us if you have any questions or would like to schedule your service.
            </p>
            <div className="flex gap-4">
              <Button size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                Call Us
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Email Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upsell Dialog */}
      <UpsellDialog
        open={showUpsell}
        onOpenChange={setShowUpsell}
        recommendedProduct={recommendedWarranty}
        techniciansNote={estimate.techniciansNote || "Our technician recommends this warranty for added protection and peace of mind."}
        onAccept={handleUpsellAccept}
        onDecline={handleUpsellDecline}
      />
    </>
  );
};
