import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
interface JobDetailsTabsProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children?: React.ReactNode;
  onEstimateTabClick?: () => void;
  onCreateEstimate?: () => void;
  onCreateInvoice?: () => void;
}
export const JobDetailsTabs = ({
  activeTab = "details",
  onTabChange,
  children,
  onEstimateTabClick,
  onCreateEstimate,
  onCreateInvoice
}: JobDetailsTabsProps) => {
  // Remove the auto-trigger functionality
  const handleTabChange = (value: string) => {
    // Simply call the onTabChange callback without the special estimate handling
    if (onTabChange) {
      onTabChange(value);
    }
  };
  return <div className="mb-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-between items-center border-b mb-4">
          <TabsList className="bg-transparent p-0 h-12">
            <TabsTrigger value="details" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12">
              Overview
            </TabsTrigger>
            <TabsTrigger value="estimates" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12">
              Estimates
            </TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12">
              Invoices
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12">
              Payments
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12">
              Messages
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-4 h-12">
              History
            </TabsTrigger>
          </TabsList>
          {(onCreateEstimate || onCreateInvoice) && <div>
              {onCreateEstimate}
              {onCreateInvoice && <Button size="sm" onClick={onCreateInvoice} className="ml-2">
                <PlusCircle className="mr-1" size={16} /> Invoice
              </Button>}
            </div>}
        </div>
        
        {children}
      </Tabs>
    </div>;
};