
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
    <div className="mb-8">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="relative mb-6">
          {/* 3D Background Container */}
          <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            {/* Glass Effect Top Border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            
            <div className="relative p-6">
              <TabsList className="bg-white/80 backdrop-blur-sm p-2 h-14 rounded-xl shadow-lg border border-slate-200/30 grid grid-cols-5 gap-1">
                <TabsTrigger 
                  value="overview" 
                  className="relative rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out
                    data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-800
                    data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-slate-100/60
                    data-[state=active]:bg-gradient-to-br data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light 
                    data-[state=active]:text-white data-[state=active]:shadow-lg
                    data-[state=active]:shadow-fixlyfy/25 data-[state=active]:scale-105
                    data-[state=active]:border data-[state=active]:border-white/20
                    hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Overview</span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="estimates" 
                  className="relative rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out
                    data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-800
                    data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-slate-100/60
                    data-[state=active]:bg-gradient-to-br data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light 
                    data-[state=active]:text-white data-[state=active]:shadow-lg
                    data-[state=active]:shadow-fixlyfy/25 data-[state=active]:scale-105
                    data-[state=active]:border data-[state=active]:border-white/20
                    hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Estimates</span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="invoices" 
                  className="relative rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out
                    data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-800
                    data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-slate-100/60
                    data-[state=active]:bg-gradient-to-br data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light 
                    data-[state=active]:text-white data-[state=active]:shadow-lg
                    data-[state=active]:shadow-fixlyfy/25 data-[state=active]:scale-105
                    data-[state=active]:border data-[state=active]:border-white/20
                    hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Invoices</span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="payments" 
                  className="relative rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out
                    data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-800
                    data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-slate-100/60
                    data-[state=active]:bg-gradient-to-br data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light 
                    data-[state=active]:text-white data-[state=active]:shadow-lg
                    data-[state=active]:shadow-fixlyfy/25 data-[state=active]:scale-105
                    data-[state=active]:border data-[state=active]:border-white/20
                    hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Payments</span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="history" 
                  className="relative rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out
                    data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-800
                    data-[state=inactive]:bg-transparent data-[state=inactive]:hover:bg-slate-100/60
                    data-[state=active]:bg-gradient-to-br data-[state=active]:from-fixlyfy data-[state=active]:to-fixlyfy-light 
                    data-[state=active]:text-white data-[state=active]:shadow-lg
                    data-[state=active]:shadow-fixlyfy/25 data-[state=active]:scale-105
                    data-[state=active]:border data-[state=active]:border-white/20
                    hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10">History</span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300"></div>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Bottom Shadow */}
            <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-slate-300/50 to-transparent"></div>
          </div>
          
          {/* External Drop Shadow */}
          <div className="absolute inset-0 rounded-2xl shadow-xl opacity-20 blur-sm transform translate-y-1"></div>
        </div>
        
        {/* Tab Content with 3D Container */}
        <div className="relative">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
            {/* Content Glass Effect */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            
            <div className="relative">
              {children}
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};
