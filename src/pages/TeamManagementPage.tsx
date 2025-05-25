import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { GradientButton } from "@/components/ui/gradient-button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Upload, Loader2, UserPlus, Users, Target, Zap, TrendingUp } from "lucide-react";
import { AddTeamMemberModal } from "@/components/team/AddTeamMemberModal";
import { UserCardRow } from "@/components/team/UserCardRow";
import { PermissionRequired, useRBAC } from "@/components/auth/RBACProvider";
import { TeamFilters } from "@/components/team/TeamFilters";
import { TeamMember } from "@/types/team";
import { TeamMemberProfile } from "@/types/team-member";
import { toast } from "sonner";
import { generateTestTeamMembers } from "@/utils/test-data";
import { supabase } from "@/integrations/supabase/client";
import { TeamInvitations } from "@/components/team/TeamInvitations";

// Helper function to convert TeamMember to TeamMemberProfile
const convertToTeamMemberProfile = (member: TeamMember): TeamMemberProfile => {
  return {
    ...member,
    isPublic: true,
    availableForJobs: true,
    twoFactorEnabled: false,
    callMaskingEnabled: false,
    laborCostPerHour: 50,
    skills: [],
    serviceAreas: [],
    scheduleColor: "#6366f1",
    internalNotes: "",
    usesTwoFactor: false
  };
};

const TeamManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { hasRole } = useRBAC();
  
  const isAdmin = hasRole('admin');
  
  // Fetch team members from Supabase on component mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const members: TeamMember[] = data.map(profile => ({
            id: profile.id,
            name: profile.name || 'Unknown',
            email: `user-${profile.id.substring(0, 8)}@fixlyfy.com`,
            role: (profile.role as "admin" | "manager" | "dispatcher" | "technician") || "technician",
            status: "active",
            avatar: profile.avatar_url || "https://github.com/shadcn.png",
            lastLogin: profile.updated_at,
          }));
          
          setTeamMembers(members);
          setFilteredMembers(members);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
        toast.error("Failed to load team members");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    let result = teamMembers;
    
    if (searchTerm) {
      const lowercaseTerm = searchTerm.toLowerCase();
      result = result.filter(
        member => 
          member.name.toLowerCase().includes(lowercaseTerm) || 
          member.email.toLowerCase().includes(lowercaseTerm)
      );
    }
    
    if (roleFilter) {
      result = result.filter(member => member.role === roleFilter);
    }
    
    if (statusFilter) {
      result = result.filter(member => member.status === statusFilter);
    }
    
    setFilteredMembers(result);
  }, [searchTerm, roleFilter, statusFilter, teamMembers]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleFilterRole = (role: string | null) => {
    setRoleFilter(role);
  };
  
  const handleFilterStatus = (status: string | null) => {
    setStatusFilter(status);
  };
  
  const handleAddNewMember = () => {
    if (isAdmin) {
      setIsModalOpen(true);
    }
  };
  
  const handleViewTeamMember = (id: string) => {
    navigate(`/admin/team/${id}`);
  };
  
  const handleImportTestData = async () => {
    setIsImporting(true);
    try {
      toast.info("Importing test team data...");
      const newMembers = await generateTestTeamMembers(6);
      if (newMembers.length > 0) {
        setTeamMembers(prevMembers => [...prevMembers, ...newMembers]);
        toast.success(`Successfully imported ${newMembers.length} team members!`);
      } else {
        toast.info("No new team members imported");
      }
    } catch (error) {
      console.error("Error importing test team data:", error);
      toast.error("Failed to import test team data");
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <PageLayout>
      <AnimatedContainer animation="fade-in">
        <PageHeader
          title="Team Management"
          subtitle="Manage your team members and track performance"
          icon={Users}
          badges={[
            { text: "Performance Tracking", icon: Target, variant: "fixlyfy" },
            { text: "Real-time Collaboration", icon: Zap, variant: "success" },
            { text: "Growth Analytics", icon: TrendingUp, variant: "info" }
          ]}
          actionButton={isAdmin ? {
            text: "Invite Team Member",
            icon: UserPlus,
            onClick: handleAddNewMember
          } : undefined}
        />
      </AnimatedContainer>

      {!isAdmin && (
        <AnimatedContainer animation="fade-in" delay={100}>
          <ModernCard variant="glass" className="p-4 mb-6">
            <div className="flex items-center gap-2 text-fixlyfy-text-secondary text-sm justify-center">
              <Shield size={16} />
              <span>Admin access required for team management</span>
            </div>
          </ModernCard>
        </AnimatedContainer>
      )}

      {isAdmin && (
        <AnimatedContainer animation="fade-in" delay={100}>
          <div className="flex justify-end mb-4">
            <GradientButton 
              onClick={handleImportTestData} 
              variant="info"
              disabled={isImporting}
              icon={isImporting ? Loader2 : Upload}
              gradient={false}
            >
              {isImporting ? "Importing..." : "Import Test Data"}
            </GradientButton>
          </div>
        </AnimatedContainer>
      )}

      {isAdmin && (
        <AnimatedContainer animation="fade-in" delay={150}>
          <div className="mb-6">
            <TeamInvitations />
          </div>
        </AnimatedContainer>
      )}
        
      <AnimatedContainer animation="fade-in" delay={200}>
        <TeamFilters
          onSearch={handleSearch}
          onFilterRole={handleFilterRole}
          onFilterStatus={handleFilterStatus}
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
        />
      </AnimatedContainer>
        
      <AnimatedContainer animation="fade-in" delay={300}>
        <ModernCard variant="elevated">
          <ModernCardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <td colSpan={6} className="py-10 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2 size={24} className="animate-spin text-primary" />
                          <span>Loading team members...</span>
                        </div>
                      </td>
                    </TableRow>
                  ) : filteredMembers.length === 0 ? (
                    <TableRow>
                      <td colSpan={6} className="py-10 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UserPlus size={24} className="text-muted-foreground/50" />
                          {searchTerm || roleFilter || statusFilter ? 
                            "No team members match your filters" : 
                            "No team members yet. Click 'Import Test Data' to add some sample data."}
                        </div>
                      </td>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <UserCardRow 
                        key={member.id}
                        user={convertToTeamMemberProfile(member)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ModernCardContent>
        </ModernCard>
      </AnimatedContainer>
      
      <AddTeamMemberModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </PageLayout>
  );
};

export default TeamManagementPage;
