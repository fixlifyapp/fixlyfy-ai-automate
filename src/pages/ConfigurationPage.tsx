
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NicheConfig } from "@/components/settings/configuration/NicheConfig";
import { TagsConfig } from "@/components/settings/configuration/TagsConfig";
import { JobTypesConfig } from "@/components/settings/configuration/JobTypesConfig";
import { JobStatusesConfig } from "@/components/settings/configuration/JobStatusesConfig";
import { CustomFieldsConfig } from "@/components/settings/configuration/CustomFieldsConfig";
import { LeadSourcesConfig } from "@/components/settings/configuration/LeadSourcesConfig";
import { Settings2, Tags, ListTodo, ClipboardList, FormInput, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const ConfigurationPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("niche");
  
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuration</h1>
        <p className="text-fixlyfy-text-secondary">
          Manage configurable elements of the application like business niche, tags, job types, statuses, and custom fields
        </p>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="bg-transparent h-auto px-6 pt-4 justify-start flex-wrap gap-2">
                <TabsTrigger value="niche" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
                  <Settings2 className="h-4 w-4" />
                  Business Niche
                </TabsTrigger>
                <TabsTrigger value="tags" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
                  <Tags className="h-4 w-4" />
                  Tags
                </TabsTrigger>
                <TabsTrigger value="job-types" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
                  <ListTodo className="h-4 w-4" />
                  Job Types
                </TabsTrigger>
                <TabsTrigger value="job-statuses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4" />
                  Job Statuses
                </TabsTrigger>
                <TabsTrigger value="custom-fields" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
                  <FormInput className="h-4 w-4" />
                  Custom Fields
                </TabsTrigger>
                <TabsTrigger value="lead-sources" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4" />
                  Lead Sources
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="niche" className="m-0">
                <NicheConfig userId={user?.id || ""} />
              </TabsContent>
              <TabsContent value="tags" className="m-0">
                <TagsConfig />
              </TabsContent>
              <TabsContent value="job-types" className="m-0">
                <JobTypesConfig />
              </TabsContent>
              <TabsContent value="job-statuses" className="m-0">
                <JobStatusesConfig />
              </TabsContent>
              <TabsContent value="custom-fields" className="m-0">
                <CustomFieldsConfig />
              </TabsContent>
              <TabsContent value="lead-sources" className="m-0">
                <LeadSourcesConfig />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ConfigurationPage;
