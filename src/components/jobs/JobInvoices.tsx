
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface JobInvoicesProps {
  jobId: string;
}

export const JobInvoices = ({ jobId }: JobInvoicesProps) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Invoices</h3>
          <Button className="gap-2" disabled>
            <PlusCircle size={16} />
            New Invoice
          </Button>
        </div>
        
        <div className="text-center py-16 text-muted-foreground">
          <p>Invoice system will be rebuilt with new database schema</p>
          <p className="mt-2">Coming soon in Phase 3</p>
        </div>
      </CardContent>
    </Card>
  );
};
