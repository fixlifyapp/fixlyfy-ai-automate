
import { useState, useEffect } from 'react';
import { TeamMemberProfile } from "@/types/team-member";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTeamMemberData = (id: string | undefined) => {
  const [member, setMember] = useState<TeamMemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMember = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch profile data from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (profile) {
          // Convert profile to TeamMemberProfile format
          const memberProfile: TeamMemberProfile = {
            id: profile.id,
            name: profile.name || 'Unknown',
            email: `${profile.name?.toLowerCase().replace(/\s+/g, '.')}@fixlyfy.com`,
            role: (profile.role as any) || "technician",
            status: "active",
            avatar: profile.avatar_url || "https://github.com/shadcn.png",
            lastLogin: profile.updated_at,
            isPublic: true,
            availableForJobs: true,
            phone: [],
            twoFactorEnabled: false,
            callMaskingEnabled: false,
            laborCostPerHour: 50,
            skills: [],
            serviceAreas: [],
            scheduleColor: "#6366f1",
            internalNotes: "",
            usesTwoFactor: false
          };
          
          setMember(memberProfile);
        } else {
          // No profile found
          setError("Team member not found");
        }
      } catch (error: any) {
        console.error("Error fetching team member:", error);
        setError(error.message || "Failed to load team member");
        toast.error("Failed to load team member");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMember();
  }, [id]);

  return { member, isLoading, error };
};
