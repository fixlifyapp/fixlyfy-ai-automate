
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SettingsGeneral } from "@/components/settings/SettingsGeneral";
import { SettingsUser } from "@/components/settings/SettingsUser";
import { SettingsCompany } from "@/components/settings/SettingsCompany";
import { SettingsIntegrations } from "@/components/settings/SettingsIntegrations";
import { ConfigurationCard } from "@/components/settings/configuration/ConfigurationCard";
import { Link } from "react-router-dom";
import { PermissionRequired } from "@/components/auth/RBACProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, UserPlus, Users, UsersRound, Tags, Settings2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-fixlyfy-text-secondary">
          Manage your account and application preferences.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Configuration Card */}
        <ConfigurationCard />
        
        {/* Role Management Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>
      
      <div className="fixlyfy-card overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 h-auto p-0 bg-fixlyfy-bg-interface">
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
          
          <TabsContent value="integrations" className="p-6">
            <SettingsIntegrations />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
