
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
        <div className="relative mb-6">
          {/* 3D Background Container */}
          <div className="absolute inset-0 bg-gradient-to-br from-fixlyfy/5 to-fixlyfy-light/10 rounded-2xl blur-sm transform translate-y-1 scale-[1.02] opacity-60"></div>
          
          {/* Main 3D Container */}
          <div className="relative bg-gradient-to-br from-white via-gray-50/80 to-white backdrop-blur-sm border border-fixlyfy/20 rounded-2xl shadow-2xl p-6">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-fixlyfy/5 via-transparent to-fixlyfy-light/5 rounded-2xl pointer-events-none"></div>
            
            {/* 3D Highlight bar */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-fixlyfy to-fixlyfy-light rounded-full opacity-60"></div>
            
            <div className="relative flex justify-between items-center">
              <TabsList className="bg-gradient-to-r from-gray-100/80 to-gray-50/60 border border-gray-200/50 p-1 rounded-xl shadow-inner backdrop-blur-sm">
                <TabsTrigger 
                  value="overview" 
                  className="relative px-6 py-3 rounded-lg text-base font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:transform data-[state=active]:scale-105 hover:shadow-md hover:bg-white/80"
                >
                  <span className="relative z-10">Overview</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="estimates" 
                  className="relative px-6 py-3 rounded-lg text-base font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:transform data-[state=active]:scale-105 hover:shadow-md hover:bg-white/80"
                >
                  <span className="relative z-10">Estimates</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="invoices" 
                  className="relative px-6 py-3 rounded-lg text-base font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:transform data-[state=active]:scale-105 hover:shadow-md hover:bg-white/80"
                >
                  <span className="relative z-10">Invoices</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="payments" 
                  className="relative px-6 py-3 rounded-lg text-base font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:transform data-[state=active]:scale-105 hover:shadow-md hover:bg-white/80"
                >
                  <span className="relative z-10">Payments</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="history" 
                  className="relative px-6 py-3 rounded-lg text-base font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fixlyfy/30 data-[state=active]:transform data-[state=active]:scale-105 hover:shadow-md hover:bg-white/80"
                >
                  <span className="relative z-10">History</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                </TabsTrigger>
              </TabsList>
              
              {/* 3D Decorative element */}
              <div className="hidden md:flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-fixlyfy to-fixlyfy-light rounded-full animate-pulse shadow-lg"></div>
                <div className="w-1 h-1 bg-fixlyfy/60 rounded-full"></div>
              </div>
            </div>
            
            {/* Bottom shadow line */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-fixlyfy/20 to-transparent"></div>
          </div>
        </div>
        
        {children}
      </Tabs>
    </div>
  );
};
