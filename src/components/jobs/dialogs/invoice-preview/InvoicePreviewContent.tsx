
import { Invoice } from "@/hooks/useInvoices";
import { InvoicePreviewHeader } from "./components/InvoicePreviewHeader";
import { InvoiceCompanyInfo } from "./components/InvoiceCompanyInfo";
import { InvoiceClientInfo } from "./components/InvoiceClientInfo";
import { InvoiceDateInfo } from "./components/InvoiceDateInfo";
import { InvoiceLineItemsTable } from "./components/InvoiceLineItemsTable";
import { InvoiceTotalsSection } from "./components/InvoiceTotalsSection";
import { InvoiceNotesSection } from "./components/InvoiceNotesSection";
import { InvoiceTermsSection } from "./components/InvoiceTermsSection";
import { useInvoicePreviewData } from "./hooks/useInvoicePreviewData";

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
}

interface InvoicePreviewContentProps {
  invoice: Invoice;
  clientInfo: ClientInfo | null;
  jobAddress: string;
}

export const InvoicePreviewContent = ({ 
  invoice, 
  clientInfo, 
  jobAddress 
}: InvoicePreviewContentProps) => {
  const {
    lineItems,
    isLoadingItems,
    calculateSubtotal,
    calculateTax
  } = useInvoicePreviewData(invoice);

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white">
      <InvoicePreviewHeader invoice={invoice} />

      <div className="grid grid-cols-2 gap-8 mb-8">
        <InvoiceCompanyInfo />
        <InvoiceClientInfo clientInfo={clientInfo} jobAddress={jobAddress} />
      </div>

      <InvoiceDateInfo invoice={invoice} />

      <InvoiceLineItemsTable 
        lineItems={lineItems} 
        isLoadingItems={isLoadingItems} 
      />

      <InvoiceTotalsSection 
        invoice={invoice}
        subtotal={calculateSubtotal()}
        tax={calculateTax()}
      />

      <InvoiceNotesSection invoice={invoice} />

      <InvoiceTermsSection />
    </div>
  );
};
