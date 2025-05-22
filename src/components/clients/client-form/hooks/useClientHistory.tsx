
import { useState, useEffect } from "react";

// Define clear union types to prevent infinite instantiation
type JobHistoryItem = {
  type: 'job';
  id: string;
  title: string;
  date: string;
  status: string;
};

type InvoiceHistoryItem = {
  type: 'invoice';
  id: string;
  number: string;
  date: string;
  amount: number;
  status: string;
};

type HistoryItem = JobHistoryItem | InvoiceHistoryItem;

export const useClientHistory = (clientId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  useEffect(() => {
    if (!clientId) return;
    
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock job history data
        const jobHistory: JobHistoryItem[] = [
          {
            type: 'job' as const,
            id: 'job-1',
            title: 'HVAC Repair',
            date: '2023-06-15',
            status: 'completed'
          },
          {
            type: 'job' as const,
            id: 'job-2',
            title: 'Annual Maintenance',
            date: '2023-05-03',
            status: 'completed'
          }
        ];
        
        // Mock invoice history data
        const invoiceHistory: InvoiceHistoryItem[] = [
          {
            type: 'invoice' as const,
            id: 'inv-1',
            number: 'INV-001',
            date: '2023-06-16',
            amount: 450,
            status: 'paid'
          },
          {
            type: 'invoice' as const,
            id: 'inv-2',
            number: 'INV-002',
            date: '2023-05-04',
            amount: 250,
            status: 'paid'
          }
        ];
        
        // Combine and sort history by date (most recent first)
        const combinedHistory: HistoryItem[] = [...jobHistory, ...invoiceHistory]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
        setHistory(combinedHistory);
      } catch (err) {
        console.error("Error fetching client history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [clientId]);
  
  return {
    history,
    isLoading
  };
};
