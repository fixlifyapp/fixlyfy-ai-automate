
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, FileText, Send, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UpsellDialog } from "@/components/jobs/dialogs/UpsellDialog";
import { EstimateBuilderDialog } from "@/components/jobs/dialogs/EstimateBuilderDialog";
import { toast } from "sonner";
import { Product } from "./builder/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { WarrantySelectionDialog } from "./dialogs/WarrantySelectionDialog";

interface JobEstimatesProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

interface EstimateItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
  taxable: boolean;
  id: string;
  category: string;
  tags: string[];
}

export const JobEstimates = ({ jobId, onEstimateConverted }: JobEstimatesProps) => {
  const [isUpsellDialogOpen, setIsUpsellDialogOpen] = useState(false);
  const [isEstimateBuilderOpen, setIsEstimateBuilderOpen] = useState(false);
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);
  const [techniciansNote, setTechniciansNote] = useState("");
  const [isConvertToInvoiceDialogOpen, setIsConvertToInvoiceDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);
  
  // In a real app, this would be fetched from an API
  const [estimates, setEstimates] = useState([
    {
      id: "est-001",
      number: "EST-12345",
      date: "2023-05-15",
      amount: 475.99,
      status: "sent",
      viewed: true,
      items: [
        {
          id: "item-1",
          name: "Diagnostic Service",
          description: "Complete system diagnostics",
          price: 120,
          quantity: 1,
          taxable: true,
          category: "Services",
          tags: ["diagnostic", "service"]
        },
        {
          id: "item-2",
          name: "HVAC Annual Maintenance",
          description: "Yearly system tune-up and maintenance",
          price: 250,
          quantity: 1,
          taxable: true,
          category: "Maintenance",
          tags: ["hvac", "maintenance"]
        },
        {
          id: "item-3",
          name: "Air Filter Replacement",
          description: "Premium air filter with installation",
          price: 55,
          quantity: 1,
          taxable: true,
          category: "Products",
          tags: ["filter", "replacement"]
        }
      ],
      recommendedProduct: {
        id: "prod-4",
        name: "1-Year Warranty",
        description: "1-year extended warranty and priority service",
        price: 89,
        category: "Warranties",
        tags: ["warranty"],
      },
      techniciansNote: "Based on the age of your unit, this warranty would provide great value."
    },
    {
      id: "est-002",
      number: "EST-12346",
      date: "2023-05-10",
      amount: 299.50,
      status: "draft",
      viewed: false,
      items: [
        {
          id: "item-4",
          name: "Minor Repair",
          description: "Quick fix and adjustment",
          price: 150,
          quantity: 1,
          taxable: true,
          category: "Services",
          tags: ["repair", "quick"]
        },
        {
          id: "item-5",
          name: "Parts Replacement",
          description: "Standard component replacement",
          price: 115,
          quantity: 1,
          taxable: true,
          category: "Products",
          tags: ["parts", "replacement"]
        }
      ],
      recommendedProduct: null,
      techniciansNote: ""
    }
  ]);

  const handleCreateEstimate = () => {
    setSelectedEstimateId(null);
    setIsEstimateBuilderOpen(true);
  };

  const handleEditEstimate = (estimateId: string) => {
    setSelectedEstimateId(estimateId);
    setIsEstimateBuilderOpen(true);
  };

  const handleViewEstimate = (estimate: any) => {
    if (!estimate.viewed && estimate.recommendedProduct) {
      // Show upsell dialog when estimate is viewed the first time
      setRecommendedProduct(estimate.recommendedProduct);
      setTechniciansNote(estimate.techniciansNote);
      setIsUpsellDialogOpen(true);
      
      // Mark as viewed
      setEstimates(estimates.map(e => 
        e.id === estimate.id ? {...e, viewed: true} : e
      ));
    } else {
      // Just view the estimate
      handleEditEstimate(estimate.id);
    }
  };

  const handleSendEstimate = (estimateId: string) => {
    // In a real app, this would send the estimate via email or other notification
    setEstimates(estimates.map(e => 
      e.id === estimateId ? {...e, status: "sent"} : e
    ));
    toast.success("Estimate sent to customer");
  };

  const handleUpsellAccept = (product: Product) => {
    toast.success(`${product.name} added to the estimate`);
    // In a real app, this would update the estimate with the added product
  };
  
  const handleConvertToInvoice = (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsConvertToInvoiceDialogOpen(true);
  };
  
  const confirmConvertToInvoice = () => {
    // In a real app, this would create a new invoice from the estimate
    toast.success(`Estimate ${selectedEstimate.number} converted to invoice`);
    setIsConvertToInvoiceDialogOpen(false);
    
    // Switch to the invoices tab if the callback is provided
    if (onEstimateConverted) {
      onEstimateConverted();
    }
  };

  const handleDeleteEstimate = (estimateId: string) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (estimate) {
      setSelectedEstimate(estimate);
      setIsDeleteConfirmOpen(true);
    }
  };
  
  const confirmDeleteEstimate = async () => {
    if (!selectedEstimate) return;
    
    setIsDeleting(true);
    
    try {
      // In a real app, this would be an actual API call
      // await fetch(`/api/estimates/${selectedEstimate.id}`, {
      //   method: 'DELETE',
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove estimate from local state
      setEstimates(estimates.filter(est => est.id !== selectedEstimate.id));
      toast.success(`Estimate ${selectedEstimate.number} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete estimate:", error);
      toast.error("Failed to delete estimate");
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleSyncToInvoice = (estimate: any) => {
    toast.success(`Estimate ${estimate.number} synced to invoice`);
    
    // Switch to the invoices tab if the callback is provided
    if (onEstimateConverted) {
      onEstimateConverted();
    }
  };
  
  const handleAddWarranty = (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsWarrantyDialogOpen(true);
  };
  
  const handleWarrantySelection = (selectedWarranty: Product | null, customNote: string) => {
    if (selectedWarranty) {
      toast.success(`${selectedWarranty.name} added to estimate ${selectedEstimate.number}`);
      // In a real app, this would update the estimate with the warranty
    }
    setIsWarrantyDialogOpen(false);
  };

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Estimates</h3>
          <Button onClick={handleCreateEstimate} className="gap-2">
            <PlusCircle size={16} />
            New Estimate
          </Button>
        </div>

        {estimates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell className="font-medium">{estimate.number}</TableCell>
                  <TableCell>{new Date(estimate.date).toLocaleDateString()}</TableCell>
                  <TableCell>${estimate.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        estimate.status === "sent" 
                          ? "bg-fixlyfy-success/10 text-fixlyfy-success border-fixlyfy-success/20" 
                          : "bg-fixlyfy-warning/10 text-fixlyfy-warning border-fixlyfy-warning/20"
                      }
                    >
                      {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => handleViewEstimate(estimate)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => handleConvertToInvoice(estimate)}
                      >
                        To Invoice
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => handleAddWarranty(estimate)}
                      >
                        Add Warranty
                      </Button>
                      {estimate.status === "draft" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => handleSendEstimate(estimate.id)}
                        >
                          Send
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs text-fixlyfy-error"
                        onClick={() => handleDeleteEstimate(estimate.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No estimates yet. Create your first estimate.</p>
          </div>
        )}
        
        <UpsellDialog 
          open={isUpsellDialogOpen} 
          onOpenChange={setIsUpsellDialogOpen}
          jobId={jobId}
          recommendedProduct={recommendedProduct}
          techniciansNote={techniciansNote}
          onAccept={handleUpsellAccept}
        />

        <EstimateBuilderDialog
          open={isEstimateBuilderOpen}
          onOpenChange={setIsEstimateBuilderOpen}
          estimateId={selectedEstimateId}
          jobId={jobId}
          onSyncToInvoice={handleSyncToInvoice}
        />
        
        {/* Convert to Invoice Dialog */}
        <Dialog open={isConvertToInvoiceDialogOpen} onOpenChange={setIsConvertToInvoiceDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Convert to Invoice</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to convert estimate {selectedEstimate?.number} to an invoice?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                This will create a new invoice with all the items from this estimate.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConvertToInvoiceDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmConvertToInvoice} className="gap-2">
                <RefreshCw size={16} />
                Convert to Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DeleteConfirmDialog 
            title="Delete Estimate"
            description={`Are you sure you want to delete estimate ${selectedEstimate?.number}? This action cannot be undone.`}
            onOpenChange={setIsDeleteConfirmOpen}
            onConfirm={confirmDeleteEstimate}
            isDeleting={isDeleting}
          />
        </Dialog>
        
        {/* Warranty Selection Dialog */}
        <WarrantySelectionDialog
          open={isWarrantyDialogOpen}
          onOpenChange={setIsWarrantyDialogOpen}
          onConfirm={handleWarrantySelection}
        />
      </CardContent>
    </Card>
  );
};
