
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, Download, ArrowRight } from "lucide-react";
import { EstimatePreviewWindowProps } from "./EstimatePreviewWindowProps";
import { formatCurrency } from "@/lib/utils";

export const EstimatePreviewWindow = ({
  open,
  onOpenChange,
  estimate,
  onConvertToInvoice
}: EstimatePreviewWindowProps) => {
  const handleConvertToInvoice = () => {
    if (onConvertToInvoice) {
      onConvertToInvoice(estimate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Estimate Preview - {estimate.estimate_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estimate Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Estimate Information</h3>
              <p className="text-sm text-gray-600">Number: {estimate.estimate_number}</p>
              <p className="text-sm text-gray-600">Date: {new Date(estimate.created_at).toLocaleDateString()}</p>
              <Badge variant={estimate.status === 'approved' ? 'success' : 'secondary'}>
                {estimate.status}
              </Badge>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Total Amount</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(estimate.total)}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="font-semibold mb-4">Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3">Qty</th>
                    <th className="text-right p-3">Price</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(estimate.items) && estimate.items.map((item: any, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.description}</td>
                      <td className="text-right p-3">{item.quantity}</td>
                      <td className="text-right p-3">{formatCurrency(item.unitPrice || 0)}</td>
                      <td className="text-right p-3">{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {estimate.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{estimate.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Send to Client
              </Button>
            </div>
            
            {estimate.status !== 'converted' && onConvertToInvoice && (
              <Button onClick={handleConvertToInvoice} className="gap-2">
                Convert to Invoice
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
