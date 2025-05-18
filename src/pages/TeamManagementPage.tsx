
import { useState, useEffect } from "react";
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
import { Plus } from "lucide-react";
import { AddTeamMemberModal } from "@/components/team/AddTeamMemberModal";
import { UserCardRow } from "@/components/team/UserCardRow";
import { PermissionRequired } from "@/components/auth/RBACProvider";
import { TeamFilters } from "@/components/team/TeamFilters";
import { TeamMember } from "@/types/team";

// Import team data
import { teamMembers as initialTeamMembers } from "@/data/team";

const TeamManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>(initialTeamMembers);

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
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Team Management</h1>
          <PermissionRequired permission="users.create" fallback={null}>
            <Button 
              onClick={() => setIsModalOpen(true)} 
              className="gap-2"
            >
              <Plus size={18} />
              Invite Team Member
            </Button>
          </PermissionRequired>
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
                      {searchTerm || roleFilter || statusFilter ? 
                        "No team members match your filters" : 
                        "No team members found"}
                    </td>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <UserCardRow 
                      key={member.id}
                      user={member}
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
