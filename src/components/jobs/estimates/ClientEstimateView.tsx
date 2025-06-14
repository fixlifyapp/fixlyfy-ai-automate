
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Check, Clock } from "lucide-react";
import { Estimate } from "@/hooks/useEstimates";
import { formatCurrency } from "@/lib/utils";

interface ClientEstimateViewProps {
  estimate: Estimate;
  onApprove?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

export const ClientEstimateView = ({
  estimate,
  onApprove,
  onReject,
  isLoading = false
}: ClientEstimateViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Smart warranty suggestion
  const suggestWarranty = () => {
    const hasRepairItems = estimate.items?.some(item => 
      item.description.toLowerCase().includes('repair') ||
      item.description.toLowerCase().includes('fix') ||
      item.description.toLowerCase().includes('install')
    );

    if (hasRepairItems && estimate.total > 200) {
      return {
        id: "warranty-suggestion",
        name: "Extended Warranty",
        description: "1-year extended warranty with priority service",
        price: 89,
        ourPrice: 0,
        ourprice: 0,
        cost: 0,
        taxable: false,
        category: "Warranty"
      };
    }
    return null;
  };

  const warrantyOption = suggestWarranty();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">
                  Estimate #{estimate.estimate_number}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Created on {new Date(estimate.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(estimate.total)}
              </div>
              <Badge variant={getStatusColor(estimate.status)}>
                {estimate.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Items</CardTitle>
        </CardHeader>
        <CardContent>
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
                {estimate.items?.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.description}</td>
                    <td className="text-right p-3">{item.quantity}</td>
                    <td className="text-right p-3">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right p-3">{formatCurrency(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Warranty Recommendation */}
      {warrantyOption && estimate.status === 'pending' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recommended Addition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-amber-900">{warrantyOption.name}</h4>
                <p className="text-sm text-amber-700">{warrantyOption.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-amber-900">
                  {formatCurrency(warrantyOption.price)}
                </div>
                <Button size="sm" variant="outline" className="mt-2">
                  Add to Estimate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {estimate.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{estimate.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {estimate.status === 'pending' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
              
              <div className="flex gap-2">
                {onReject && (
                  <Button 
                    variant="outline" 
                    onClick={onReject}
                    disabled={isLoading}
                  >
                    Request Changes
                  </Button>
                )}
                {onApprove && (
                  <Button 
                    onClick={onApprove}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {isLoading ? 'Processing...' : 'Approve Estimate'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
