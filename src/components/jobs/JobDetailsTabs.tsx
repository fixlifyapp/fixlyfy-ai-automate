
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
          <div className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/60 rounded-2xl shadow-lg shadow-gray-200/50 p-4 backdrop-blur-sm">
            <TabsList className="bg-gradient-to-r from-gray-100/80 to-gray-50/60 p-2 rounded-xl w-full shadow-inner border border-gray-200/40">
              <TabsTrigger 
                value="overview" 
                className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:border data-[state=active]:border-white/20 hover:bg-white/70"
              >
                Overview
              </TabsTrigger>
              
              <TabsTrigger 
                value="estimates" 
                className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:border data-[state=active]:border-white/20 hover:bg-white/70"
              >
                Estimates
              </TabsTrigger>
              
              <TabsTrigger 
                value="invoices" 
                className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:border data-[state=active]:border-white/20 hover:bg-white/70"
              >
                Invoices
              </TabsTrigger>
              
              <TabsTrigger 
                value="payments" 
                className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:border data-[state=active]:border-white/20 hover:bg-white/70"
              >
                Payments
              </TabsTrigger>
              
              <TabsTrigger 
                value="history" 
                className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:border data-[state=active]:border-white/20 hover:bg-white/70"
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
