
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InvoiceStatusData {
  name: string;
  value: number;
  color: string;
}

interface InvoiceStatusBreakdownProps {
  isRefreshing?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
        <p className="font-medium">{`${payload[0].name}: ${payload[0].value.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}`}</p>
      </div>
    );
  }
  return null;
};

export const InvoiceStatusBreakdown = ({ isRefreshing = false }: InvoiceStatusBreakdownProps) => {
  const [invoiceData, setInvoiceData] = useState<InvoiceStatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch all invoices
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select('id, status, total')
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        // Calculate totals by status
        const statusTotals: Record<string, number> = {
          'paid': 0,
          'pending': 0,
          'overdue': 0,
          'partial': 0
        };
        
        let totalAmount = 0;
        
        invoices?.forEach(invoice => {
          const status = invoice.status?.toLowerCase() || 'pending';
          if (statusTotals[status] !== undefined) {
            statusTotals[status] += Number(invoice.total) || 0;
          } else {
            statusTotals[status] = Number(invoice.total) || 0;
          }
          totalAmount += Number(invoice.total) || 0;
        });
        
        setTotal(totalAmount);
        
        // Format data for chart
        const chartData: InvoiceStatusData[] = [
          { name: 'Paid', value: statusTotals['paid'], color: '#10B981' },
          { name: 'Pending', value: statusTotals['pending'], color: '#3B82F6' },
          { name: 'Overdue', value: statusTotals['overdue'], color: '#EF4444' },
          { name: 'Partial', value: statusTotals['partial'], color: '#F59E0B' },
        ].filter(item => item.value > 0);
        
        setInvoiceData(chartData.length > 0 ? chartData : [
          { name: 'No Data', value: 100, color: '#E5E7EB' }
        ]);
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        setInvoiceData([
          { name: 'No Data', value: 100, color: '#E5E7EB' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvoiceData();
  }, [user, isRefreshing]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Invoice Status</CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate('/invoices')}>
          Go to Invoices
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading || isRefreshing ? (
          <div className="h-[250px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-fixlyfy" />
          </div>
        ) : (
          <>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={invoiceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {invoiceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-fixlyfy-text-secondary">Total Invoice Amount</p>
              <p className="text-2xl font-bold">${total.toLocaleString()}</p>
              <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/reminders')}>
                <Send size={16} className="mr-2" />
                Send Reminders to All
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
