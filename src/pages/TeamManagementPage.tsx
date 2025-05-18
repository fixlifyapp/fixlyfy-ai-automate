
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
import { useState } from "react";
import { AddTeamMemberModal } from "@/components/team/AddTeamMemberModal";
import { UserCardRow } from "@/components/team/UserCardRow";
import { PermissionRequired } from "@/components/auth/RBACProvider";

// Sample team data for demonstration
import { teamMembers } from "@/data/team";

const TeamManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
              Add Team Member
            </Button>
          </PermissionRequired>
        </div>
        
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
                {teamMembers.map((member) => (
                  <UserCardRow 
                    key={member.id}
                    user={member}
                  />
                ))}
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
