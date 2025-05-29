
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

interface JobDetailsTabsProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children?: React.ReactNode;
  onEstimateTabClick?: () => void;
}

export const JobDetailsTabs = ({
  activeTab = "overview",
  onTabChange,
  children,
  onEstimateTabClick
}: JobDetailsTabsProps) => {
  // Handle tab change functionality
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };
  
  return <div className="mb-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-between items-center border-b mb-4">
          <TabsList className="bg-transparent p-0 h-14">
            <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-6 h-14 text-lg font-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="estimates" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-6 h-14 text-lg font-medium">
              Estimates
            </TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-6 h-14 text-lg font-medium">
              Invoices
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-6 h-14 text-lg font-medium">
              Payments
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none px-6 h-14 text-lg font-medium">
              History
            </TabsTrigger>
          </TabsList>
        </div>
        
        {children}
      </Tabs>
    </div>;
};
