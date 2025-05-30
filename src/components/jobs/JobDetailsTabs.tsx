
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
  
  return (
    <div className="mb-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="mb-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
            <TabsList className="bg-gray-50 p-1 rounded-md w-full">
              <TabsTrigger 
                value="overview" 
                className="px-4 py-2 rounded text-sm font-medium transition-all duration-200 data-[state=active]:bg-fixlyfy data-[state=active]:text-white hover:bg-gray-100"
              >
                Overview
              </TabsTrigger>
              
              <TabsTrigger 
                value="estimates" 
                className="px-4 py-2 rounded text-sm font-medium transition-all duration-200 data-[state=active]:bg-fixlyfy data-[state=active]:text-white hover:bg-gray-100"
              >
                Estimates
              </TabsTrigger>
              
              <TabsTrigger 
                value="invoices" 
                className="px-4 py-2 rounded text-sm font-medium transition-all duration-200 data-[state=active]:bg-fixlyfy data-[state=active]:text-white hover:bg-gray-100"
              >
                Invoices
              </TabsTrigger>
              
              <TabsTrigger 
                value="payments" 
                className="px-4 py-2 rounded text-sm font-medium transition-all duration-200 data-[state=active]:bg-fixlyfy data-[state=active]:text-white hover:bg-gray-100"
              >
                Payments
              </TabsTrigger>
              
              <TabsTrigger 
                value="history" 
                className="px-4 py-2 rounded text-sm font-medium transition-all duration-200 data-[state=active]:bg-fixlyfy data-[state=active]:text-white hover:bg-gray-100"
              >
                History
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        {children}
      </Tabs>
    </div>
  );
};
