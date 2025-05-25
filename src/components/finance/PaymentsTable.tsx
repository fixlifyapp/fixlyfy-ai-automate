
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
import { PanelRightOpen, Receipt, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentsTableProps {
  payments: Payment[];
  onRefund: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
  canRefund: boolean;
  canDelete?: boolean;
  isLoading?: boolean;
}

export function PaymentsTable({ 
  payments, 
  onRefund, 
  onDelete, 
  canRefund, 
  canDelete = false,
  isLoading = false
}: PaymentsTableProps) {
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

  const renderLoadingState = () => (
    <>
      {Array(5).fill(0).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );

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
          {isLoading ? (
            renderLoadingState()
          ) : payments.length === 0 ? (
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
                  {(payment.client_id || payment.clientId) ? (
                    <Link to={`/clients/${payment.client_id || payment.clientId}`} className="text-blue-600 hover:underline">
                      {payment.clientName || 'N/A'}
                    </Link>
                  ) : (
                    <span>{payment.clientName || 'N/A'}</span>
                  )}
                </TableCell>
                <TableCell>
                  {(payment.job_id || payment.jobId) ? (
                    <Link to={`/jobs/${payment.job_id || payment.jobId}`} className="text-blue-600 hover:underline">
                      #{payment.job_id || payment.jobId}
                    </Link>
                  ) : (
                    <span>N/A</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                <TableCell className="capitalize">{payment.method.replace("-", " ")}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getStatusBadgeColor(payment.status)} capitalize`}>
                    {payment.status || 'paid'}
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
                  {canDelete && (
                    <Button
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => onDelete && onDelete(payment)}
                    >
                      <Trash2 className="h-4 w-4" />
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
