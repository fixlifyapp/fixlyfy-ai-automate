
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, Send, RefreshCw, Trash2, MoreHorizontal, FileText, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Document } from "./DocumentManagement";

interface DocumentTableProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelectDocument: (docId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onPreviewDocument: (document: Document) => void;
  getStatusBadgeColor: (status: string, type: string) => string;
  isLoading: boolean;
}

export const DocumentTable = ({
  documents,
  selectedDocuments,
  onSelectDocument,
  onSelectAll,
  onPreviewDocument,
  getStatusBadgeColor,
  isLoading,
}: DocumentTableProps) => {
  const allSelected = documents.length > 0 && documents.every(doc => selectedDocuments.includes(doc.id));
  const someSelected = selectedDocuments.length > 0 && !allSelected;

  const getDocumentIcon = (type: string) => {
    return type === 'estimate' ? (
      <FileText className="h-4 w-4 text-blue-600" />
    ) : (
      <DollarSign className="h-4 w-4 text-green-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loading...</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Loading documents...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No documents found</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No documents match your current filters.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Document #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow 
              key={document.id}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => onPreviewDocument(document)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedDocuments.includes(document.id)}
                  onCheckedChange={(checked) => onSelectDocument(document.id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getDocumentIcon(document.type)}
                  <span className="capitalize">{document.type}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono">{document.number}</TableCell>
              <TableCell>{document.client_name}</TableCell>
              <TableCell>
                <div>
                  <div className="font-semibold">{formatCurrency(document.total)}</div>
                  {document.type === 'invoice' && document.balance !== undefined && document.balance > 0 && (
                    <div className="text-xs text-orange-600">
                      Balance: {formatCurrency(document.balance)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(document.status, document.type)}>
                  {document.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <div>{new Date(document.date).toLocaleDateString()}</div>
                  {document.due_date && (
                    <div className="text-xs text-muted-foreground">
                      Due: {new Date(document.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onPreviewDocument(document)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </DropdownMenuItem>
                      {document.type === 'estimate' && document.status === 'approved' && (
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Convert to Invoice
                        </DropdownMenuItem>
                      )}
                      {document.type === 'invoice' && document.status === 'sent' && (
                        <DropdownMenuItem>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Record Payment
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
