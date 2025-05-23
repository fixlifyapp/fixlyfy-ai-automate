
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagsConfig } from "./configuration/TagsConfig";
import { JobTypesConfig } from "./configuration/JobTypesConfig";
import { JobStatusesConfig } from "./configuration/JobStatusesConfig";
import { CustomFieldsConfig } from "./configuration/CustomFieldsConfig";
import { LeadSourcesConfig } from "./configuration/LeadSourcesConfig";
import { NicheConfig } from "./configuration/NicheConfig";
import { useAuth } from "@/hooks/use-auth";

export function SettingsConfiguration() {
  const [activeTab, setActiveTab] = useState("niche");
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Configuration</h2>
        <p className="text-muted-foreground">
          Manage configurable elements of the application like business niche, tags, job types, statuses, and custom fields
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="niche">Business Niche</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="job-types">Job Types</TabsTrigger>
          <TabsTrigger value="job-statuses">Job Statuses</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="lead-sources">Lead Sources</TabsTrigger>
        </TabsList>
        <TabsContent value="niche" className="pt-4">
          <NicheConfig userId={user?.id} />
        </TabsContent>
        <TabsContent value="tags" className="pt-4">
          <TagsConfig />
        </TabsContent>
        <TabsContent value="job-types" className="pt-4">
          <JobTypesConfig />
        </TabsContent>
        <TabsContent value="job-statuses" className="pt-4">
          <JobStatusesConfig />
        </TabsContent>
        <TabsContent value="custom-fields" className="pt-4">
          <CustomFieldsConfig />
        </TabsContent>
        <TabsContent value="lead-sources" className="pt-4">
          <LeadSourcesConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
