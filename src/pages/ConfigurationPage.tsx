
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobTypesConfig } from "@/components/settings/configuration/JobTypesConfig";
import { JobStatusesConfig } from "@/components/settings/configuration/JobStatusesConfig";
import { CustomFieldsConfig } from "@/components/settings/configuration/CustomFieldsConfig";
import { TagsConfig } from "@/components/settings/configuration/TagsConfig";
import { LeadSourcesConfig } from "@/components/settings/configuration/LeadSourcesConfig";
import { NicheConfig } from "@/components/settings/configuration/NicheConfig";
import { useUnifiedRealtime } from "@/hooks/useUnifiedRealtime";

const ConfigurationPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Set up real-time updates for configuration page
  useUnifiedRealtime({
    tables: ['job_types', 'job_statuses', 'custom_fields', 'tags', 'lead_sources'],
    onUpdate: () => {
      console.log('Real-time update triggered for configuration page');
      setRefreshTrigger(prev => prev + 1);
    },
    enabled: true
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
          <p className="text-gray-600">Configure job types, statuses, custom fields, and more</p>
        </div>

        <Tabs defaultValue="job-types" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="job-types">Job Types</TabsTrigger>
            <TabsTrigger value="job-statuses">Job Statuses</TabsTrigger>
            <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="lead-sources">Lead Sources</TabsTrigger>
            <TabsTrigger value="niche">Business Niche</TabsTrigger>
          </TabsList>

          <TabsContent value="job-types">
            <JobTypesConfig key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="job-statuses">
            <JobStatusesConfig key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="custom-fields">
            <CustomFieldsConfig key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="tags">
            <TagsConfig key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="lead-sources">
            <LeadSourcesConfig key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="niche">
            <NicheConfig key={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ConfigurationPage;
