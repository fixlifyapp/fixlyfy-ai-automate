
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsGeneral } from "@/components/settings/SettingsGeneral";
import { SettingsUser } from "@/components/settings/SettingsUser";
import { SettingsCompany } from "@/components/settings/SettingsCompany";
import { SettingsIntegrations } from "@/components/settings/SettingsIntegrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PermissionRequired } from "@/components/auth/RBACProvider";
import { UsersRound, Settings2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NicheConfig } from "@/components/settings/configuration/NicheConfig";
import { TagsConfig } from "@/components/settings/configuration/TagsConfig";
import { JobTypesConfig } from "@/components/settings/configuration/JobTypesConfig";
import { JobStatusesConfig } from "@/components/settings/configuration/JobStatusesConfig";
import { CustomFieldsConfig } from "@/components/settings/configuration/CustomFieldsConfig";
import { LeadSourcesConfig } from "@/components/settings/configuration/LeadSourcesConfig";

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [configActiveTab, setConfigActiveTab] = useState("niche");
  
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-fixlyfy-text-secondary">
          Manage your account and application preferences.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <PermissionRequired permission="users.roles.assign">
          <Link to="/admin/roles">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="flex items-center p-6 space-x-4">
                <div className="bg-fixlyfy/10 p-3 rounded-full">
                  <UsersRound className="h-6 w-6 text-fixlyfy" />
                </div>
                <div>
                  <h3 className="font-medium">Role Management</h3>
                  <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </PermissionRequired>
        
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={configActiveTab} onValueChange={setConfigActiveTab}>
              <TabsList className="w-full justify-start px-6 border-b rounded-none bg-transparent h-12">
                <TabsTrigger value="niche" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy rounded-none h-12">
                  Business Niche
                </TabsTrigger>
                <TabsTrigger value="tags" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy rounded-none h-12">
                  Tags
                </TabsTrigger>
                <TabsTrigger value="job-types" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy rounded-none h-12">
                  Job Types
                </TabsTrigger>
                <TabsTrigger value="job-statuses" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy rounded-none h-12">
                  Job Statuses
                </TabsTrigger>
                <TabsTrigger value="custom-fields" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy rounded-none h-12">
                  Custom Fields
                </TabsTrigger>
                <TabsTrigger value="lead-sources" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-fixlyfy rounded-none h-12">
                  Lead Sources
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="niche" className="mt-0 p-0">
                  <NicheConfig userId={user?.id} />
                </TabsContent>
                <TabsContent value="tags" className="mt-0 p-0">
                  <TagsConfig />
                </TabsContent>
                <TabsContent value="job-types" className="mt-0 p-0">
                  <JobTypesConfig />
                </TabsContent>
                <TabsContent value="job-statuses" className="mt-0 p-0">
                  <JobStatusesConfig />
                </TabsContent>
                <TabsContent value="custom-fields" className="mt-0 p-0">
                  <CustomFieldsConfig />
                </TabsContent>
                <TabsContent value="lead-sources" className="mt-0 p-0">
                  <LeadSourcesConfig />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="fixlyfy-card overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 h-auto p-0 bg-fixlyfy-bg-interface">
            <TabsTrigger 
              value="general" 
              className="py-4 rounded-none data-[state=active]:bg-white"
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="user" 
              className="py-4 rounded-none data-[state=active]:bg-white"
            >
              Your Profile
            </TabsTrigger>
            <TabsTrigger 
              value="company" 
              className="py-4 rounded-none data-[state=active]:bg-white"
            >
              Company
            </TabsTrigger>
            <TabsTrigger 
              value="configuration" 
              className="py-4 rounded-none data-[state=active]:bg-white"
            >
              Configuration
            </TabsTrigger>
            <TabsTrigger 
              value="integrations" 
              className="py-4 rounded-none data-[state=active]:bg-white"
            >
              Integrations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="p-6">
            <SettingsGeneral />
          </TabsContent>
          
          <TabsContent value="user" className="p-6">
            <SettingsUser />
          </TabsContent>
          
          <TabsContent value="company" className="p-6">
            <SettingsCompany />
          </TabsContent>
          
          <TabsContent value="configuration" className="p-6">
            <div className="text-center py-4 text-muted-foreground">
              Configuration options have been moved to the top of this page.
            </div>
          </TabsContent>
          
          <TabsContent value="integrations" className="p-6">
            <SettingsIntegrations />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
