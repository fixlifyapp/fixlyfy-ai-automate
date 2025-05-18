
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobDetailsTabsProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children?: React.ReactNode;
}

export const JobDetailsTabs = ({ 
  activeTab = "details", 
  onTabChange,
  children 
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
        <div className="flex overflow-x-auto border-b mb-4">
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
