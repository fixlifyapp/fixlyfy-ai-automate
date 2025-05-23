
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsGeneral } from "@/components/settings/SettingsGeneral";
import { SettingsUser } from "@/components/settings/SettingsUser";
import { SettingsCompany } from "@/components/settings/SettingsCompany";
import { SettingsIntegrations } from "@/components/settings/SettingsIntegrations";
import { SettingsConfiguration } from "@/components/settings/SettingsConfiguration";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PermissionRequired } from "@/components/auth/RBACProvider";
import { Settings, UserPlus, Users, UsersRound, Tags, Settings2 } from "lucide-react";
import { NicheConfig } from "@/components/settings/configuration/NicheConfig";
import { useAuth } from "@/hooks/use-auth";

const SettingsPage = () => {
  const { user } = useAuth();
  
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
        
        <Card className="h-full hover:shadow-md transition-shadow">
          <CardContent className="flex items-center p-6 space-x-4">
            <div className="bg-fixlyfy/10 p-3 rounded-full">
              <Settings2 className="h-6 w-6 text-fixlyfy" />
            </div>
            <div>
              <h3 className="font-medium">Business Niche</h3>
              <p className="text-sm text-muted-foreground">Configure your business specialization</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <NicheConfig userId={user?.id} />
      </div>
      
      <div className="fixlyfy-card overflow-hidden">
        <Tabs defaultValue="general" className="w-full">
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
            <SettingsConfiguration />
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
