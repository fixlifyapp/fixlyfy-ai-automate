
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, Send, RefreshCw, Trash2, Download, Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useEstimates } from "@/hooks/useEstimates";
import { useInvoices } from "@/hooks/useInvoices";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { BulkActions } from "./BulkActions";
import { DocumentFilters } from "./DocumentFilters";
import { DocumentTable } from "./DocumentTable";

interface DocumentManagementProps {
  jobId: string;
  onCreateEstimate?: () => void;
  onCreateInvoice?: () => void;
}

export type Document = {
  id: string;
  type: 'estimate' | 'invoice';
  number: string;
  client_name: string;
  total: number;
  status: string;
  date: string;
  due_date?: string;
  balance?: number;
  amount_paid?: number;
};

export const DocumentManagement = ({ jobId, onCreateEstimate, onCreateInvoice }: DocumentManagementProps) => {
  const { estimates, isLoading: estimatesLoading } = useEstimates(jobId);
  const { invoices, isLoading: invoicesLoading } = useInvoices(jobId);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // Combine and transform documents
  const allDocuments = useMemo(() => {
    const docs: Document[] = [];
    
    // Add estimates
    if (estimates) {
      estimates.forEach(estimate => {
        docs.push({
          id: estimate.id,
          type: 'estimate',
          number: estimate.estimate_number || estimate.number || `EST-${estimate.id.slice(0, 8)}`,
          client_name: estimate.client_name || 'Unknown Client',
          total: estimate.total || estimate.amount || 0,
          status: estimate.status || 'draft',
          date: estimate.date || estimate.created_at,
        });
      });
    }
    
    // Add invoices
    if (invoices) {
      invoices.forEach(invoice => {
        docs.push({
          id: invoice.id,
          type: 'invoice',
          number: invoice.invoice_number || invoice.number || `INV-${invoice.id.slice(0, 8)}`,
          client_name: invoice.client_name || 'Unknown Client',
          total: invoice.total || invoice.amount || 0,
          status: invoice.status || 'draft',
          date: invoice.date || invoice.created_at,
          due_date: invoice.due_date,
          balance: invoice.balance || (invoice.total - (invoice.amount_paid || 0)),
          amount_paid: invoice.amount_paid || 0,
        });
      });
    }
    
    return docs;
  }, [estimates, invoices]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = allDocuments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.total.toString().includes(searchTerm)
      );
    }

    // Filter by type
    if (filterType !== "all") {
      if (filterType === "estimates") {
        filtered = filtered.filter(doc => doc.type === 'estimate');
      } else if (filterType === "invoices") {
        filtered = filtered.filter(doc => doc.type === 'invoice');
      }
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(doc => doc.status === filterStatus);
    }

    // Sort documents
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'client':
          aValue = a.client_name.toLowerCase();
          bValue = b.client_name.toLowerCase();
          break;
        case 'number':
          aValue = a.number.toLowerCase();
          bValue = b.number.toLowerCase();
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allDocuments, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  // Calculate totals
  const totals = useMemo(() => {
    const estimates = filteredDocuments.filter(d => d.type === 'estimate');
    const invoices = filteredDocuments.filter(d => d.type === 'invoice');
    
    return {
      totalRevenue: filteredDocuments.reduce((sum, doc) => sum + doc.total, 0),
      estimatesTotal: estimates.reduce((sum, doc) => sum + doc.total, 0),
      invoicesTotal: invoices.reduce((sum, doc) => sum + doc.total, 0),
      paidAmount: invoices.reduce((sum, doc) => sum + (doc.amount_paid || 0), 0),
      outstandingBalance: invoices.reduce((sum, doc) => sum + (doc.balance || 0), 0),
    };
  }, [filteredDocuments]);

  const handleSelectDocument = (docId: string, selected: boolean) => {
    if (selected) {
      setSelectedDocuments([...selectedDocuments, docId]);
    } else {
      setSelectedDocuments(selectedDocuments.filter(id => id !== docId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const getStatusBadgeColor = (status: string, type: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      converted: "bg-purple-100 text-purple-800",
      paid: "bg-green-100 text-green-800",
      partial: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const isLoading = estimatesLoading || invoicesLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Documents</h2>
          <p className="text-muted-foreground">Manage estimates and invoices</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreateEstimate} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Estimate
          </Button>
          <Button onClick={onCreateInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Estimates</div>
            <div className="text-2xl font-bold">{formatCurrency(totals.estimatesTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Paid Amount</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.paidAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Outstanding</div>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totals.outstandingBalance)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <DocumentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <BulkActions
          selectedDocuments={selectedDocuments}
          documents={filteredDocuments}
          onClearSelection={() => setSelectedDocuments([])}
        />
      )}

      {/* Document Table */}
      <DocumentTable
        documents={filteredDocuments}
        selectedDocuments={selectedDocuments}
        onSelectDocument={handleSelectDocument}
        onSelectAll={handleSelectAll}
        onPreviewDocument={setPreviewDocument}
        getStatusBadgeColor={getStatusBadgeColor}
        isLoading={isLoading}
      />

      {/* Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          open={!!previewDocument}
          onOpenChange={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
};
