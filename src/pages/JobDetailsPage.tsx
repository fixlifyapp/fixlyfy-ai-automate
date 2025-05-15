
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { JobDetailsQuickActions } from "@/components/jobs/JobDetailsQuickActions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Package, 
  CreditCard, 
  FileCheck, 
  Paperclip, 
  CheckSquare, 
  Wrench, 
  MessageSquare 
} from "lucide-react";

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
                  <FileText size={16} className="mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="items" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <Package size={16} className="mr-2" />
                  Items
                </TabsTrigger>
                <TabsTrigger 
                  value="payments" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <CreditCard size={16} className="mr-2" />
                  Payments
                </TabsTrigger>
                <TabsTrigger 
                  value="estimates" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <FileCheck size={16} className="mr-2" />
                  Estimates
                </TabsTrigger>
                <TabsTrigger 
                  value="attachments" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <Paperclip size={16} className="mr-2" />
                  Attachments
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <CheckSquare size={16} className="mr-2" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="equipment" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <Wrench size={16} className="mr-2" />
                  Equipment
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Chat
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Job Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-fixlyfy-text-secondary text-sm">Job Type</p>
                        <p>HVAC Repair</p>
                      </div>
                      <div>
                        <p className="text-fixlyfy-text-secondary text-sm">Scheduled Date & Time</p>
                        <p>May 15, 2023 at 1:30 PM</p>
                      </div>
                      <div>
                        <p className="text-fixlyfy-text-secondary text-sm">Technician</p>
                        <p>Robert Smith</p>
                      </div>
                      <div>
                        <p className="text-fixlyfy-text-secondary text-sm">Priority</p>
                        <p>Medium</p>
                      </div>
                      <div>
                        <p className="text-fixlyfy-text-secondary text-sm">Service Area</p>
                        <p>North District</p>
                      </div>
                      <div>
                        <p className="text-fixlyfy-text-secondary text-sm">Source</p>
                        <p>Phone Call</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-4">Description</h3>
                    <p className="text-fixlyfy-text-secondary">
                      Customer reported that their HVAC unit is not cooling properly. 
                      The unit is making unusual noises when running. 
                      The system is about 8 years old, a Carrier model 24ACC6.
                    </p>
                    <div className="mt-6">
                      <h3 className="font-medium mb-4">Notes</h3>
                      <p className="text-fixlyfy-text-secondary">
                        Customer mentioned they've had issues with this unit before. 
                        Previous service was done by our technician John Doe last summer.
                        Customer prefers morning appointments.
                      </p>
                    </div>
                  </div>
                </div>
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
