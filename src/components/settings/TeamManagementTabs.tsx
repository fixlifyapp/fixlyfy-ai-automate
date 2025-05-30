
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { TeamMembersTab } from "@/components/settings/team-tabs/TeamMembersTab";
import { RolesPermissionsTab } from "@/components/settings/team-tabs/RolesPermissionsTab";
import { InvitationsTab } from "@/components/settings/team-tabs/InvitationsTab";
import { TeamNotificationsTab } from "@/components/settings/team-tabs/TeamNotificationsTab";
import { TeamSecurityTab } from "@/components/settings/team-tabs/TeamSecurityTab";
import { Users, Shield, Mail, Bell, Lock } from "lucide-react";

export const TeamManagementTabs = () => {
  const [activeTab, setActiveTab] = useState("members");

  return (
    <ModernCard variant="elevated">
      <ModernCardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 h-auto p-0 bg-fixlyfy-bg-interface">
            <TabsTrigger 
              value="members" 
              className="py-4 rounded-none data-[state=active]:bg-white flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger 
              value="roles" 
              className="py-4 rounded-none data-[state=active]:bg-white flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger 
              value="invitations" 
              className="py-4 rounded-none data-[state=active]:bg-white flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Invitations
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="py-4 rounded-none data-[state=active]:bg-white flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="py-4 rounded-none data-[state=active]:bg-white flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="p-6">
            <TeamMembersTab />
          </TabsContent>
          
          <TabsContent value="roles" className="p-6">
            <RolesPermissionsTab />
          </TabsContent>
          
          <TabsContent value="invitations" className="p-6">
            <InvitationsTab />
          </TabsContent>
          
          <TabsContent value="notifications" className="p-6">
            <TeamNotificationsTab />
          </TabsContent>
          
          <TabsContent value="security" className="p-6">
            <TeamSecurityTab />
          </TabsContent>
        </Tabs>
      </ModernCardContent>
    </ModernCard>
  );
};
