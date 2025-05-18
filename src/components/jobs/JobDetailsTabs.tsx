
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobDetailsTabsProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children?: React.ReactNode;
  invoiceAmount?: number;
  balance?: number;
}

export const JobDetailsTabs = ({ 
  activeTab = "details", 
  onTabChange,
  children,
  invoiceAmount = 0,
  balance = 0
}: JobDetailsTabsProps) => {
  return (
    <div className="mb-6">
      <Tabs
        defaultValue={activeTab}
        onValueChange={(value) => {
          if (onTabChange) onTabChange(value);
        }}
        className="w-full"
      >
        <div className="flex justify-between items-center border-b mb-4">
          <TabsList className="bg-transparent p-0 h-12">
            <TabsTrigger
              value="details"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="estimates"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12"
            >
              Estimates
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12"
            >
              Invoices
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12"
            >
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12"
            >
              History
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4 mr-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total:</span>{" "}
              <span className="font-medium">${invoiceAmount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Balance:</span>{" "}
              <span className={`font-medium ${balance > 0 ? "text-orange-500" : "text-green-500"}`}>
                ${balance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        {children}
      </Tabs>
    </div>
  );
};
