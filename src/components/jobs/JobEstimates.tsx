
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, FileText, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UpsellDialog } from "@/components/jobs/dialogs/UpsellDialog";
import { EstimateBuilderDialog } from "@/components/jobs/dialogs/EstimateBuilderDialog";

interface JobEstimatesProps {
  jobId: string;
}

export const JobEstimates = ({ jobId }: JobEstimatesProps) => {
  const [isUpsellDialogOpen, setIsUpsellDialogOpen] = useState(false);
  const [isEstimateBuilderOpen, setIsEstimateBuilderOpen] = useState(false);
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);
  
  // In a real app, this would be fetched from an API
  const estimates = [
    {
      id: "est-001",
      number: "EST-12345",
      date: "2023-05-15",
      amount: 475.99,
      status: "sent"
    },
    {
      id: "est-002",
      number: "EST-12346",
      date: "2023-05-10",
      amount: 299.50,
      status: "draft"
    }
  ];

  const handleCreateEstimate = () => {
    setIsEstimateBuilderOpen(true);
    // Show upsell dialog when creating a new estimate
    setIsUpsellDialogOpen(true);
  };

  const handleEditEstimate = (estimateId: string) => {
    setSelectedEstimateId(estimateId);
    setIsEstimateBuilderOpen(true);
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
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditEstimate(estimate.id)}
                      >
                        <FileText size={16} />
                      </Button>
                      {estimate.status === "draft" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                        >
                          <Send size={16} />
                        </Button>
                      )}
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
        />

        <EstimateBuilderDialog
          open={isEstimateBuilderOpen}
          onOpenChange={setIsEstimateBuilderOpen}
          estimateId={selectedEstimateId}
          jobId={jobId}
        />
      </CardContent>
    </Card>
  );
};
