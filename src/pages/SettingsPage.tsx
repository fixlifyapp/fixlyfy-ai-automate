
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, User, Bell, Shield, Phone, Cog, Users } from "lucide-react";
import { PhoneNumberManagement } from "@/components/settings/PhoneNumberManagement";
import { ConfigurationSettings } from "@/components/settings/ConfigurationSettings";
import { TeamManagementSettings } from "@/components/settings/TeamManagementSettings";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <PageLayout>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and application preferences"
        icon={Settings}
      />
      
      <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 mb-6">
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
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Cog size={16} />
            <span className="hidden sm:inline">Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users size={16} />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-0">
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">General Settings</h3>
            <p className="text-gray-500">General application settings coming soon.</p>
          </div>
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
        
        <TabsContent value="configuration" className="mt-0">
          <ConfigurationSettings />
        </TabsContent>
        
        <TabsContent value="team" className="mt-0">
          <TeamManagementSettings />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default SettingsPage;
