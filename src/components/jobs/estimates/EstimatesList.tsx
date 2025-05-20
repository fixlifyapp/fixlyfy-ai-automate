
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstimateActions } from "./EstimateActions";
import { Skeleton } from "@/components/ui/skeleton";

interface EstimateItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  taxable: boolean;
  category: string;
  tags: string[];
}

interface Estimate {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: string;
  viewed: boolean;
  items: EstimateItem[];
  recommendedProduct: any;
  techniciansNote: string;
}

interface EstimatesListProps {
  estimates: Estimate[];
  isLoading?: boolean;
  onEdit: (estimateId: string) => void;
  onConvert: (estimate: any) => void;
  onAddWarranty: (estimate: any) => void;
  onSend: (estimateId: string) => void;
  onDelete: (estimateId: string) => void;
}

export const EstimatesList = ({
  estimates,
  isLoading = false,
  onEdit,
  onConvert,
  onAddWarranty,
  onSend,
  onDelete,
}: EstimatesListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No estimates yet. Create your first estimate.</p>
      </div>
    );
  }

  return (
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
                    : estimate.status === "converted"
                      ? "bg-fixlyfy-primary/10 text-fixlyfy-primary border-fixlyfy-primary/20"
                      : "bg-fixlyfy-warning/10 text-fixlyfy-warning border-fixlyfy-warning/20"
                }
              >
                {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <EstimateActions 
                estimate={estimate}
                onEdit={onEdit}
                onConvert={onConvert}
                onAddWarranty={onAddWarranty}
                onSend={onSend}
                onDelete={onDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
