
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
import { supabase } from "@/integrations/supabase/client";

const TeamMemberProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useRBAC();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { member, isLoading, error } = useTeamMemberData(id);
  const isAdmin = hasRole('admin');
  
  // Only admins can edit team members
  const canEditTeamMembers = isAdmin;
  
  const handleGoBack = () => {
    navigate("/admin/team");
  };
  
  const handleSave = async () => {
    if (!member) return;
    
    setIsSaving(true);
    
    try {
      // In a real app, update member data in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: member.name,
          avatar_url: member.avatar,
          // Add other fields as needed
        })
        .eq('id', member.id);
        
      if (error) throw error;
      
      toast.success("Team member profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member profile");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!member || error) {
    return <NotFoundState onGoBack={handleGoBack} error={error} />;
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
            isSaving={isSaving}
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
