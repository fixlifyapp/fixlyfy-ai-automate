
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, UserCog } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProfileTab } from "@/components/team/profile/ProfileTab";
import { AdvancedTab } from "@/components/team/profile/AdvancedTab";
import { CommissionsTab } from "@/components/team/profile/CommissionsTab";
import { useRBAC } from "@/components/auth/RBACProvider";
import { toast } from "sonner";
import { teamMembers as initialTeamMembers } from "@/data/team";
import { TeamMemberProfile } from "@/types/team-member";

// Mock expanded profile data
const expandedTeamMembers: Record<string, TeamMemberProfile> = {
  "1": {
    id: "1",
    name: "John Smith",
    email: "john.smith@fixlyfy.com",
    role: "admin",
    status: "active",
    avatar: "https://github.com/shadcn.png",
    lastLogin: new Date("2025-05-17T10:30:00").toISOString(),
    isPublic: true,
    availableForJobs: true,
    phone: ["555-123-4567"],
    address: "123 Main St, San Francisco, CA",
    twoFactorEnabled: true,
    callMaskingEnabled: false,
    laborCostPerHour: 75,
    skills: [
      { id: "1", name: "Plumbing" },
      { id: "2", name: "Electrical" }
    ],
    serviceAreas: [
      { id: "1", name: "San Francisco", zipCode: "94103" },
      { id: "2", name: "Oakland", zipCode: "94612" }
    ],
    scheduleColor: "#4f46e5",
    internalNotes: "Senior technician with 10+ years experience.",
    usesTwoFactor: true
  },
  "2": {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@fixlyfy.com",
    role: "manager",
    status: "active",
    avatar: "https://github.com/shadcn.png",
    lastLogin: new Date("2025-05-16T14:22:00").toISOString(),
    isPublic: true,
    availableForJobs: false,
    phone: ["555-987-6543"],
    address: "456 Market St, San Francisco, CA",
    twoFactorEnabled: false,
    callMaskingEnabled: true,
    laborCostPerHour: 85,
    skills: [
      { id: "3", name: "HVAC" },
      { id: "4", name: "Customer Management" }
    ],
    serviceAreas: [
      { id: "1", name: "San Francisco", zipCode: "94103" },
      { id: "3", name: "San Jose", zipCode: "95113" }
    ],
    scheduleColor: "#8b5cf6",
    internalNotes: "Great with customer escalations.",
    usesTwoFactor: false
  }
};

const TeamMemberProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [member, setMember] = useState<TeamMemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch team member data
  useEffect(() => {
    if (id) {
      // In a real app, this would be an API call
      const basicMember = initialTeamMembers.find(m => m.id === id);
      if (basicMember) {
        const expandedMember = expandedTeamMembers[id] || {
          ...basicMember,
          isPublic: true,
          availableForJobs: true,
          phone: [],
          twoFactorEnabled: false,
          callMaskingEnabled: false,
          laborCostPerHour: 50,
          skills: [],
          serviceAreas: [],
          scheduleColor: "#6366f1",
          usesTwoFactor: false
        };
        setMember(expandedMember);
      }
    }
    setIsLoading(false);
  }, [id]);
  
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
  
  const canEditTeamMembers = hasPermission("users.edit");
  
  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 w-56 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (!member) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Team Member Not Found</h1>
            <Button onClick={handleGoBack}>Return to Team List</Button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col space-y-6">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleGoBack} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {member.name}
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium 
                    ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                    member.role === 'manager' ? 'bg-indigo-100 text-indigo-800' :
                    member.role === 'technician' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'}`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </h1>
                <p className="text-muted-foreground">{member.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {canEditTeamMembers && (
                isEditing ? (
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                ) : (
                  <Button onClick={handleEdit} className="gap-2">
                    <UserCog className="h-4 w-4" />
                    Edit Profile
                  </Button>
                )
              )}
            </div>
          </div>
          
          {/* Tabs section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Card className="border-fixlyfy-border shadow-sm">
              <div className="px-4 pt-4">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="profile" className="flex-1 sm:flex-initial">Profile</TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1 sm:flex-initial">Advanced</TabsTrigger>
                  <TabsTrigger value="commissions" className="flex-1 sm:flex-initial">Commissions</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="px-4 pb-4">
                <TabsContent value="profile" className="mt-4 space-y-4">
                  <ProfileTab member={member} isEditing={isEditing} />
                </TabsContent>
                
                <TabsContent value="advanced" className="mt-4 space-y-4">
                  <AdvancedTab member={member} isEditing={isEditing} />
                </TabsContent>
                
                <TabsContent value="commissions" className="mt-4 space-y-4">
                  <CommissionsTab member={member} isEditing={isEditing} />
                </TabsContent>
              </div>
            </Card>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};

export default TeamMemberProfilePage;
