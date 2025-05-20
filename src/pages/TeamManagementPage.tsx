
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Upload, Loader2, UserPlus } from "lucide-react";
import { AddTeamMemberModal } from "@/components/team/AddTeamMemberModal";
import { UserCardRow } from "@/components/team/UserCardRow";
import { PermissionRequired, useRBAC } from "@/components/auth/RBACProvider";
import { TeamFilters } from "@/components/team/TeamFilters";
import { TeamMember } from "@/types/team";
import { TeamMemberProfile } from "@/types/team-member";
import { toast } from "sonner";
import { generateTestTeamMembers } from "@/utils/test-data-generator";

// Import team data
import { teamMembers as initialTeamMembers } from "@/data/team";

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
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [isImporting, setIsImporting] = useState(false);
  const [importCompleted, setImportCompleted] = useState(false);
  const navigate = useNavigate();
  const { hasRole } = useRBAC();
  
  const isAdmin = hasRole('admin');

  // Apply filters whenever filters change
  useEffect(() => {
    let result = initialTeamMembers;
    
    // Apply search filter
    if (searchTerm) {
      const lowercaseTerm = searchTerm.toLowerCase();
      result = result.filter(
        member => 
          member.name.toLowerCase().includes(lowercaseTerm) || 
          member.email.toLowerCase().includes(lowercaseTerm)
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      result = result.filter(member => member.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(member => member.status === statusFilter);
    }
    
    setFilteredMembers(result);
  }, [searchTerm, roleFilter, statusFilter]);

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
  
  // Handle importing test data
  const handleImportTestData = async () => {
    setIsImporting(true);
    try {
      toast.info("Importing test team data...");
      const newMembers = await generateTestTeamMembers(6);
      if (newMembers.length > 0) {
        // Add the new members to the display
        setFilteredMembers(prevMembers => [...prevMembers, ...newMembers]);
        toast.success("Successfully imported 6 test team members!");
      } else {
        toast.info("Team members already exist - no new data imported");
      }
      setImportCompleted(true);
    } catch (error) {
      console.error("Error importing test team data:", error);
      toast.error("Failed to import test team data");
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Team Management</h1>
          <div className="flex gap-2">
            {!importCompleted && isAdmin && (
              <Button 
                onClick={handleImportTestData} 
                variant="outline"
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={18} className="mr-2" />
                    Import Test Data
                  </>
                )}
              </Button>
            )}
            {isAdmin ? (
              <Button 
                onClick={handleAddNewMember} 
                className="gap-2"
              >
                <UserPlus size={18} />
                Invite Team Member
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Shield size={16} />
                <span>Admin access required for team management</span>
              </div>
            )}
          </div>
        </div>
        
        <TeamFilters
          onSearch={handleSearch}
          onFilterRole={handleFilterRole}
          onFilterStatus={handleFilterStatus}
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
        />
        
        <Card className="border-fixlyfy-border shadow-sm">
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
                {filteredMembers.length === 0 ? (
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
        </Card>
      </div>
      
      <AddTeamMemberModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </PageLayout>
  );
};

export default TeamManagementPage;
