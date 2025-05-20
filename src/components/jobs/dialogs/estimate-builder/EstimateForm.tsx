
import { useState, useEffect } from "react";
import { useEstimateInfo } from "@/components/jobs/estimates/hooks/useEstimateInfo";
import { EstimateEditor } from "./EstimateEditor";
import { LineItemsTable } from "./LineItemsTable";
import { toast } from "sonner";

interface EstimateItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  taxable: boolean;
  estimate_id: string;
}

interface Estimate {
  id?: string;
  job_id: string;
  number: string;
  date: string;
  amount: number;
  status: string;
  viewed: boolean;
  discount: number;
  tax_rate: number;
  technicians_note?: string;
  created_at: string;
  updated_at: string;
}

interface EstimateFormProps {
  estimateId: string | null;
  jobId: string;
  onSyncToInvoice?: () => void;
}

export function EstimateForm({ estimateId, jobId, onSyncToInvoice }: EstimateFormProps) {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [lineItems, setLineItems] = useState<EstimateItem[]>([]);
  const estimateInfo = useEstimateInfo();

  useEffect(() => {
    // Initialize with default values for a new estimate
    const defaultEstimate: Estimate = {
      job_id: jobId,
      number: estimateInfo.generateUniqueNumber('EST'),
      date: new Date().toISOString(),
      amount: 0,
      status: 'draft',
      viewed: false,
      discount: 0,
      tax_rate: 0,
      technicians_note: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setEstimate(defaultEstimate);
    
    // For demonstration purposes, add a sample line item
    if (estimateId) {
      const sampleItem: EstimateItem = {
        id: 'sample-1',
        name: 'Sample Item',
        description: 'This is a sample item for demonstration',
        price: 100,
        quantity: 1,
        taxable: true,
        estimate_id: 'sample-estimate'
      };
      
      setLineItems([sampleItem]);
    } else {
      setLineItems([]);
    }
  }, [estimateId, jobId, estimateInfo]);

  const addEmptyLineItem = async () => {
    if (!estimate) {
      toast.error("Estimate not loaded");
      return null;
    }
    
    const newItem: EstimateItem = {
      id: `new-${Date.now()}`,
      name: "New Item",
      description: "",
      price: 0,
      quantity: 1,
      taxable: true,
      estimate_id: estimate.id || 'temp'
    };
    
    setLineItems(prev => [...prev, newItem]);
    return newItem;
  };

  const addCustomLine = async (name: string, price: number, quantity: number, taxable: boolean) => {
    if (!estimate) {
      toast.error("Estimate not loaded");
      return;
    }
    
    const newItem: EstimateItem = {
      id: `custom-${Date.now()}`,
      name,
      description: name,
      price,
      quantity,
      taxable,
      estimate_id: estimate.id || 'temp'
    };
    
    setLineItems(prev => [...prev, newItem]);
  };

  const removeLine = async (lineId: string) => {
    setLineItems(prev => prev.filter(item => item.id !== lineId));
  };

  const updateLine = async (lineId: string, updates: any) => {
    setLineItems(prev =>
      prev.map(item => (item.id === lineId ? { ...item, ...updates } : item))
    );
    return lineItems.find(item => item.id === lineId);
  };

  const handleUpdateDiscount = async (discount: number) => {
    setEstimate(prev => prev ? { ...prev, discount } : null);
  };

  const handleUpdateTax = async (tax_rate: number) => {
    setEstimate(prev => prev ? { ...prev, tax_rate } : null);
  };

  const handleUpdateNote = async (technicians_note: string) => {
    setEstimate(prev => prev ? { ...prev, technicians_note } : null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <EstimateEditor
          lineItems={lineItems}
          onAddEmptyLineItem={addEmptyLineItem}
          onAddCustomLine={addCustomLine}
          onRemoveLine={removeLine}
          onUpdateLine={updateLine}
          onUpdateDiscount={handleUpdateDiscount}
          onUpdateTax={handleUpdateTax}
          onUpdateNote={handleUpdateNote}
          discount={estimate?.discount || 0}
          taxRate={estimate?.tax_rate || 0}
          note={estimate?.technicians_note || ""}
        />
      </div>
      <div>
        <LineItemsTable
          lineItems={lineItems}
          onRemoveLineItem={removeLine}
          onUpdateLineItem={updateLine}
          onEditLineItem={() => false}
        />
        {onSyncToInvoice && (
          <button onClick={onSyncToInvoice} className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Sync to Invoice
          </button>
        )}
      </div>
    </div>
  );
}
