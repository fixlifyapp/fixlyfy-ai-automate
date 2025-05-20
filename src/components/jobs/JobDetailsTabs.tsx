
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

interface JobDetailsTabsProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children?: React.ReactNode;
  onEstimateTabClick?: () => void;
}

export const JobDetailsTabs = ({ 
  activeTab = "details", 
  onTabChange,
  children,
  onEstimateTabClick
}: JobDetailsTabsProps) => {
  const [shouldTriggerEstimateAction, setShouldTriggerEstimateAction] = useState(false);

  const handleTabChange = (value: string) => {
    if (value === "estimates" && onEstimateTabClick) {
      setShouldTriggerEstimateAction(true);
    }
    
    if (onTabChange) {
      onTabChange(value);
    }
  };

  // Run the estimate action only after the tab has been switched
  useEffect(() => {
    if (shouldTriggerEstimateAction && activeTab === "estimates") {
      if (onEstimateTabClick) {
        onEstimateTabClick();
      }
      setShouldTriggerEstimateAction(false);
    }
  }, [activeTab, onEstimateTabClick, shouldTriggerEstimateAction]);

  return (
    <div className="mb-6">
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={handleTabChange}
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
        </div>
        
        {children}
      </Tabs>
    </div>
  );
};
