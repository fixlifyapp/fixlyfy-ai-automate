
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calculator, CreditCard } from "lucide-react";

interface DocumentWizardProps {
  jobId: string;
  type: 'estimate' | 'invoice';
}

export const DocumentWizard = ({ jobId, type }: DocumentWizardProps) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'estimate' ? <Calculator className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
          Create {type === 'estimate' ? 'Estimate' : 'Invoice'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-16">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unified Document System</h3>
          <p className="text-muted-foreground mb-6">
            The new document management system will handle estimates, invoices, and payments in a unified workflow.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Unified document schema</p>
            <p>✓ Streamlined workflow</p>
            <p>✓ Better client experience</p>
            <p>✓ Integrated payments</p>
          </div>
          <Button className="mt-6" disabled>
            Coming Soon - Phase 4
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
