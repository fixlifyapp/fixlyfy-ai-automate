
import { format } from "date-fns";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Payment } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { PanelRightOpen, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaymentsTableProps {
  payments: Payment[];
  onRefund: (payment: Payment) => void;
  canRefund: boolean;
}

export function PaymentsTable({ payments, onRefund, canRefund }: PaymentsTableProps) {
  // In a real application, we would implement pagination here
  // For now, we'll just show all payments

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadgeColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'refunded':
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case 'disputed':
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Client Name</TableHead>
            <TableHead>Job #</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No payments found
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{format(new Date(payment.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Link to={`/clients/${payment.clientId}`} className="text-blue-600 hover:underline">
                    {payment.clientName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/jobs/${payment.jobId}`} className="text-blue-600 hover:underline">
                    #{payment.jobId}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                <TableCell className="capitalize">{payment.method.replace("-", " ")}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getStatusBadgeColor(payment.status)} capitalize`}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <Receipt className="h-4 w-4 mr-1" />
                    <span>Invoice</span>
                  </Button>
                  {payment.status === 'paid' && canRefund && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50" 
                      onClick={() => onRefund(payment)}
                    >
                      Refund
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
