
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagsConfig } from "./configuration/TagsConfig";
import { JobTypesConfig } from "./configuration/JobTypesConfig";
import { JobStatusesConfig } from "./configuration/JobStatusesConfig";
import { CustomFieldsConfig } from "./configuration/CustomFieldsConfig";
import { LeadSourcesConfig } from "./configuration/LeadSourcesConfig";

export function SettingsConfiguration() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Configuration</h2>
        <p className="text-muted-foreground">
          Manage configurable elements of the application like tags, job types, statuses, and custom fields
        </p>
      </div>

      <Tabs defaultValue="tags">
        <TabsList>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="job-types">Job Types</TabsTrigger>
          <TabsTrigger value="job-statuses">Job Statuses</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="lead-sources">Lead Sources</TabsTrigger>
        </TabsList>
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
