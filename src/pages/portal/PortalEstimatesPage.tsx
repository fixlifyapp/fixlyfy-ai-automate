
import React from 'react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, Calendar, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { UnifiedDocumentPreview } from '@/components/jobs/dialogs/unified/UnifiedDocumentPreview';

const PortalEstimatesPage = () => {
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Mock estimates data - in real app this would come from API
  const estimates = [
    {
      id: 'EST-001',
      number: 'EST-2024-001',
      date: '2024-01-15',
      status: 'pending',
      total: 1250.00,
      jobTitle: 'HVAC System Maintenance',
      lineItems: [
        {
          id: '1',
          description: 'HVAC System Inspection',
          quantity: 1,
          unitPrice: 150.00,
          taxable: true,
          name: 'HVAC System Inspection',
          price: 150.00,
          total: 150.00
        },
        {
          id: '2', 
          description: 'Filter Replacement',
          quantity: 2,
          unitPrice: 45.00,
          taxable: true,
          name: 'Filter Replacement',
          price: 45.00,
          total: 90.00
        }
      ]
    }
  ];

  const handleViewEstimate = (estimate) => {
    setSelectedEstimate(estimate);
    setPreviewOpen(true);
  };

  const calculateSubtotal = () => {
    if (!selectedEstimate) return 0;
    return selectedEstimate.lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.13; // 13% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Estimates</h1>
          <p className="text-muted-foreground">
            View and download your service estimates
          </p>
        </div>

        <div className="grid gap-6">
          {estimates.map((estimate) => (
            <Card key={estimate.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{estimate.number}</CardTitle>
                    <CardDescription>{estimate.jobTitle}</CardDescription>
                  </div>
                  <Badge variant={estimate.status === 'pending' ? 'default' : 'secondary'}>
                    {estimate.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{estimate.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">${estimate.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleViewEstimate(estimate)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle>Estimate Preview</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-auto max-h-[80vh]">
                        {selectedEstimate && (
                          <UnifiedDocumentPreview
                            documentType="estimate"
                            documentNumber={selectedEstimate.number}
                            lineItems={selectedEstimate.lineItems}
                            taxRate={13}
                            calculateSubtotal={calculateSubtotal}
                            calculateTotalTax={calculateTax}
                            calculateGrandTotal={calculateTotal}
                            notes=""
                            issueDate={selectedEstimate.date}
                            dueDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
};

export default PortalEstimatesPage;
