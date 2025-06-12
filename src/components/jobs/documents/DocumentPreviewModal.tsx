
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit, Send, Download, RefreshCw, DollarSign, FileText, Calendar, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Document } from "./DocumentManagement";

interface DocumentPreviewModalProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentPreviewModal = ({
  document,
  open,
  onOpenChange,
}: DocumentPreviewModalProps) => {
  const getStatusColor = (status: string) => {
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

  const getDocumentIcon = () => {
    return document.type === 'estimate' ? (
      <FileText className="h-6 w-6 text-blue-600" />
    ) : (
      <DollarSign className="h-6 w-6 text-green-600" />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getDocumentIcon()}
            <span className="capitalize">{document.type} Preview</span>
            <Badge className={getStatusColor(document.status)}>
              {document.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{document.number}</h3>
                  <p className="text-muted-foreground">{document.client_name}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(document.total)}</div>
                  {document.type === 'invoice' && document.balance !== undefined && (
                    <div className="text-sm text-muted-foreground">
                      Balance: {formatCurrency(document.balance)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Document Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div>{new Date(document.date).toLocaleDateString()}</div>
                  </div>
                </div>
                
                {document.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Due Date</div>
                      <div>{new Date(document.due_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Client</div>
                    <div>{document.client_name}</div>
                  </div>
                </div>
                
                {document.type === 'invoice' && document.amount_paid !== undefined && (
                  <div>
                    <div className="text-sm text-muted-foreground">Amount Paid</div>
                    <div className="text-green-600 font-semibold">
                      {formatCurrency(document.amount_paid)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Document Content Preview */}
          <Card>
            <CardHeader>
              <h4 className="font-semibold">Document Preview</h4>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-6 rounded-lg min-h-[200px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Document content would appear here</p>
                  <p className="text-sm">Full preview coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit {document.type}
            </Button>
            
            <Button variant="outline" className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Send {document.type}
            </Button>
            
            {document.type === 'estimate' && document.status === 'approved' && (
              <Button variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Convert to Invoice
              </Button>
            )}
            
            {document.type === 'invoice' && document.status === 'sent' && (
              <Button variant="outline" className="flex-1">
                <DollarSign className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
