
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { JobDetailsTabs } from "@/components/jobs/JobDetailsTabs";
import { JobDetailsQuickActions } from "@/components/jobs/JobDetailsQuickActions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <PageLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <JobDetailsHeader id={id} />
          
          <Card>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto p-0 bg-fixlyfy-bg-interface">
                <TabsTrigger 
                  value="details" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="items" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  Items
                </TabsTrigger>
                <TabsTrigger 
                  value="payments" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  Payments
                </TabsTrigger>
                <TabsTrigger 
                  value="estimates" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  Estimates
                </TabsTrigger>
                <TabsTrigger 
                  value="attachments" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  Attachments
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="equipment" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  Equipment
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  Chat
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="p-6">
                <JobDetailsTabs />
              </TabsContent>
              
              <TabsContent value="items" className="p-6">
                <h3 className="text-lg font-medium mb-4">Items & Parts</h3>
                <p className="text-fixlyfy-text-secondary">Items and parts details will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="payments" className="p-6">
                <h3 className="text-lg font-medium mb-4">Payments</h3>
                <p className="text-fixlyfy-text-secondary">Payment information will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="estimates" className="p-6">
                <h3 className="text-lg font-medium mb-4">Estimates</h3>
                <p className="text-fixlyfy-text-secondary">Estimate details will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="attachments" className="p-6">
                <h3 className="text-lg font-medium mb-4">Attachments</h3>
                <p className="text-fixlyfy-text-secondary">Attached files will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="tasks" className="p-6">
                <h3 className="text-lg font-medium mb-4">Tasks</h3>
                <p className="text-fixlyfy-text-secondary">Job tasks will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="equipment" className="p-6">
                <h3 className="text-lg font-medium mb-4">Equipment</h3>
                <p className="text-fixlyfy-text-secondary">Equipment details will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="chat" className="p-6">
                <h3 className="text-lg font-medium mb-4">Chat</h3>
                <p className="text-fixlyfy-text-secondary">Job-related conversations will be displayed here.</p>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        <div>
          <JobDetailsQuickActions />
        </div>
      </div>
    </PageLayout>
  );
};

export default JobDetailsPage;
