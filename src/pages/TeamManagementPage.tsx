
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Plus, Shield, Settings, Target, Brain, UserPlus, Edit, Trash2, Eye } from "lucide-react";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { TeamInviteModal } from "@/components/team/TeamInviteModal";
import { TeamRoleManager } from "@/components/team/TeamRoleManager";
import { TeamPermissions } from "@/components/team/TeamPermissions";
import { TeamOverview } from "@/components/team/TeamOverview";
import { useRBAC } from "@/components/auth/RBACProvider";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  last_login?: string;
  phone?: string;
  created_at: string;
}

const TeamManagementPage = () => {
  const { user } = useAuth();
  const { hasPermission, hasRole } = useRBAC();
  const [activeTab, setActiveTab] = useState("overview");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Check permissions
  const canViewTeam = hasPermission('users.view') || hasRole('admin');
  const canManageTeam = hasPermission('users.manage') || hasRole('admin');
  const canInviteUsers = hasPermission('users.invite') || hasRole('admin');

  useEffect(() => {
    if (canViewTeam) {
      loadTeamMembers();
    }
  }, [canViewTeam]);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          avatar_url,
          status,
          phone,
          created_at,
          role
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMembers: TeamMember[] = data?.map(member => ({
        id: member.id,
        name: member.name || 'Unknown',
        email: '', // Email not available in profiles table
        role: member.role || 'member',
        status: (member.status === 'active' || member.status === 'inactive' || member.status === 'pending') 
          ? member.status as 'active' | 'inactive' | 'pending'
          : 'active', // Default to 'active' if status doesn't match expected values
        avatar: member.avatar_url,
        last_login: undefined, // Not available in current schema
        phone: member.phone,
        created_at: member.created_at
      })) || [];

      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    setIsInviteModalOpen(false);
    loadTeamMembers();
    toast.success('Team member invited successfully!');
  };

  const handleEditMember = (memberId: string) => {
    setSelectedMember(memberId);
    // Navigate to edit modal or page
    toast.info('Edit member functionality coming soon');
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!canManageTeam) {
      toast.error('You do not have permission to delete team members');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Team member deactivated successfully');
      loadTeamMembers();
    } catch (error) {
      console.error('Error deactivating team member:', error);
      toast.error('Failed to deactivate team member');
    }
  };

  const handleViewMember = (memberId: string) => {
    // Navigate to member profile
    window.open(`/admin/team/${memberId}`, '_blank');
  };

  // Show permission denied if user can't view team
  if (!canViewTeam) {
    return (
      <PageLayout>
        <PageHeader
          title="Team Management"
          subtitle="Manage your team members, roles, and permissions"
          icon={Users}
          badges={[
            { text: "Team Coordination", icon: Users, variant: "fixlify" },
            { text: "Role Management", icon: Shield, variant: "success" },
            { text: "Access Control", icon: Target, variant: "info" }
          ]}
        />
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to view team management.
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Team Management"
        subtitle="Manage your team members, roles, and permissions"
        icon={Users}
        badges={[
          { text: "Team Coordination", icon: Users, variant: "fixlify" },
          { text: "Role Management", icon: Shield, variant: "success" },
          { text: "Access Control", icon: Target, variant: "info" }
        ]}
        actionButton={canInviteUsers ? {
          text: "Invite Member",
          icon: UserPlus,
          onClick: () => setIsInviteModalOpen(true)
        } : undefined}
      />

      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <TeamOverview 
              teamMembers={teamMembers}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="members" className="space-y-6">
            <TeamMembersList 
              members={teamMembers}
              isLoading={isLoading}
              canEdit={canManageTeam}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              onView={handleViewMember}
              onRefresh={loadTeamMembers}
            />
          </TabsContent>
          
          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TeamRoleManager />
              <TeamPermissions />
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Team Settings
                </CardTitle>
                <CardDescription>
                  Configure team-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">General Settings</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Require two-factor authentication</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Enable team notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Auto-assign jobs to available technicians</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Access Control</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Restrict sensitive data access</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Enable IP restrictions</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Audit log all user actions</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full md:w-auto">
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Team Invite Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <TeamInviteModal 
          onOpenChange={setIsInviteModalOpen}
          onSuccess={handleInviteSuccess}
        />
      </Dialog>
    </PageLayout>
  );
};

export default TeamManagementPage;
