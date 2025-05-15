
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export const JobDetailsTabs = () => {
  return (
    <div className="fixlyfy-card">
      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 bg-transparent p-0 border-b border-fixlyfy-border">
          <TabsTrigger 
            value="details" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none"
          >
            <FileText size={16} className="mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger 
            value="items" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none"
          >
            <Package size={16} className="mr-2" />
            Items
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none"
          >
            <CreditCard size={16} className="mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger 
            value="estimates" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none"
          >
            <FileCheck size={16} className="mr-2" />
            Estimates
          </TabsTrigger>
          <TabsTrigger 
            value="attachments" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none"
          >
            <Paperclip size={16} className="mr-2" />
            Attachments
          </TabsTrigger>
          <TabsTrigger 
            value="tasks" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none"
          >
            <CheckSquare size={16} className="mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="equipment" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none"
          >
            <Wrench size={16} className="mr-2" />
            Equipment
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy data-[state=active]:shadow-none"
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
          <p className="text-center text-fixlyfy-text-secondary">Item and parts details will be displayed here.</p>
        </TabsContent>
        <TabsContent value="payments" className="p-6">
          <p className="text-center text-fixlyfy-text-secondary">Payment information will be displayed here.</p>
        </TabsContent>
        <TabsContent value="estimates" className="p-6">
          <p className="text-center text-fixlyfy-text-secondary">Estimate information will be displayed here.</p>
        </TabsContent>
        <TabsContent value="attachments" className="p-6">
          <p className="text-center text-fixlyfy-text-secondary">Job attachments will be displayed here.</p>
        </TabsContent>
        <TabsContent value="tasks" className="p-6">
          <p className="text-center text-fixlyfy-text-secondary">Tasks will be displayed here.</p>
        </TabsContent>
        <TabsContent value="equipment" className="p-6">
          <p className="text-center text-fixlyfy-text-secondary">Equipment information will be displayed here.</p>
        </TabsContent>
        <TabsContent value="chat" className="p-6">
          <p className="text-center text-fixlyfy-text-secondary">Chat history will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
