
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useRBAC } from "@/components/auth/RBACProvider";
import { toast } from "sonner";
import { TeamMemberHeader } from "@/components/team/profile/TeamMemberHeader";
import { TeamMemberTabs } from "@/components/team/profile/TeamMemberTabs";
import { LoadingState } from "@/components/team/profile/LoadingState";
import { NotFoundState } from "@/components/team/profile/NotFoundState";
import { useTeamMemberData } from "@/hooks/useTeamMemberData";

const TeamMemberProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useRBAC();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  
  const { member, isLoading } = useTeamMemberData(id);
  const isAdmin = hasRole('admin');
  
  // Only admins can edit team members
  const canEditTeamMembers = isAdmin;
  
  const handleGoBack = () => {
    navigate("/admin/team");
  };
  
  const handleSave = () => {
    // In a real app, this would save to a database
    toast.success("Team member profile updated successfully");
    setIsEditing(false);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!member) {
    return <NotFoundState onGoBack={handleGoBack} />;
  }
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col space-y-6">
          {/* Header section */}
          <TeamMemberHeader 
            member={member}
            isEditing={isEditing}
            canEdit={canEditTeamMembers}
            onGoBack={handleGoBack}
            onEdit={handleEdit}
            onSave={handleSave}
          />
          
          {/* Tabs section */}
          <TeamMemberTabs 
            member={member}
            isEditing={isEditing}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default TeamMemberProfilePage;
