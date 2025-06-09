
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Eye, FileText, Send } from 'lucide-react';

interface ClientEstimateViewProps {
  estimateId: string;
  clientView?: boolean;
}

export const ClientEstimateView = ({ estimateId, clientView = false }: ClientEstimateViewProps) => {
  // Mock estimate data
  const estimate = {
    id: estimateId,
    estimate_number: 'EST-001',
    total: 750.00,
    status: 'draft',
    items: []
  };

  const [isLoading] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Estimate #{estimate.estimate_number}
          <Badge variant="outline" className="ml-auto">
            {estimate.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Client estimate view - Coming soon in Phase 4
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
