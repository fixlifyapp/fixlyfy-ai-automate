
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NicheConfig } from "./NicheConfig";
import { TagsConfig } from "./TagsConfig";
import { JobTypesConfig } from "./JobTypesConfig";
import { JobStatusesConfig } from "./JobStatusesConfig";
import { CustomFieldsConfig } from "./CustomFieldsConfig";
import { LeadSourcesConfig } from "./LeadSourcesConfig";
import { useAuth } from "@/hooks/use-auth";
import { Settings2, Tags, ListTodo, ClipboardList, FormInput, MessageCircle } from "lucide-react";

export function ConfigurationCard() {
  const [activeTab, setActiveTab] = useState("niche");
  const { user } = useAuth();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Manage configurable elements of the application like business niche, tags, job types, statuses, and custom fields
            </CardDescription>
          </div>
        </div>
      </CardHeader>
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
              <NicheConfig userId={user?.id} />
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
  );
}
