
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Bell, Shield, Phone, Cog, Users, ChevronRight } from "lucide-react";
import { PhoneNumberManagement } from "@/components/settings/PhoneNumberManagement";
import { ConfigurationSettings } from "@/components/settings/ConfigurationSettings";
import { TeamManagementSettings } from "@/components/settings/TeamManagementSettings";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // If a section is active, show that section
  if (activeSection === "configuration") {
    return (
      <PageLayout>
        <PageHeader
          title="Configuration Settings"
          subtitle="Manage your business configuration and system settings"
          icon={Cog}
        />
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setActiveSection(null)}
            className="gap-2"
          >
            ← Back to Settings
          </Button>
        </div>
        <ConfigurationSettings />
      </PageLayout>
    );
  }

  if (activeSection === "team") {
    return (
      <PageLayout>
        <PageHeader
          title="Team Management"
          subtitle="Manage your team members, roles, and permissions"
          icon={Users}
        />
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setActiveSection(null)}
            className="gap-2"
          >
            ← Back to Settings
          </Button>
        </div>
        <TeamManagementSettings />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and application preferences"
        icon={Settings}
      />
      
      <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings size={16} />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={16} />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="phone-numbers" className="flex items-center gap-2">
            <Phone size={16} />
            <span className="hidden sm:inline">Phone Numbers</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-0 space-y-6">
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">General Settings</h3>
            <p className="text-gray-500">General application settings coming soon.</p>
          </div>

          {/* Configuration Card */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection("configuration")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Cog className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>
                  Manage business niche, tags, job types, custom fields, and more
                </CardDescription>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
          </Card>

          {/* Team Management Card */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection("team")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Management
                </CardTitle>
                <CardDescription>
                  Manage team members, roles, permissions, and invitations
                </CardDescription>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile" className="mt-0">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Settings</h3>
            <p className="text-gray-500">Profile management coming soon.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-0">
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Settings</h3>
            <p className="text-gray-500">Notification preferences coming soon.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="mt-0">
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Security Settings</h3>
            <p className="text-gray-500">Security and privacy settings coming soon.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="phone-numbers" className="mt-0">
          <PhoneNumberManagement />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default SettingsPage;
