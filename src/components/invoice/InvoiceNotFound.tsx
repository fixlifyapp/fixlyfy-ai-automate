
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface InvoiceNotFoundProps {
  onBack: () => void;
}

export const InvoiceNotFound = ({ onBack }: InvoiceNotFoundProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invoice Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The invoice you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={onBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
