
import { useState, useEffect } from 'react';
import { TeamMemberProfile } from "@/types/team-member";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamMemberCommission, TeamMemberSkill, ServiceArea, ProfileRow, DatabaseFunctions } from "@/types/database";

export const useTeamMemberData = (id: string | undefined) => {
  const [member, setMember] = useState<TeamMemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMember = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch profile data from Supabase with extended information
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (profile) {
        // Use RPC function to get commission data with proper parameter naming
        const { data: commissionData, error: commissionError } = await supabase
          .rpc('get_team_member_commission' as DatabaseFunctions, { p_team_member_id: id });
        
        if (commissionError) {
          console.error("Error fetching commission data:", commissionError);
        }
        
        // Use RPC function to get skills with proper parameter naming
        const { data: skillsData, error: skillsError } = await supabase
          .rpc('get_team_member_skills' as DatabaseFunctions, { p_team_member_id: id });
        
        if (skillsError) {
          console.error("Error fetching skills data:", skillsError);
        }
        
        // Use RPC function to get service areas with proper parameter naming
        const { data: serviceAreasData, error: serviceAreasError } = await supabase
          .rpc('get_service_areas' as DatabaseFunctions, { p_team_member_id: id });
        
        if (serviceAreasError) {
          console.error("Error fetching service areas data:", serviceAreasError);
        }
        
        // Extract data or provide defaults
        const skills = skillsData || [];
        const serviceAreas = serviceAreasData || [];
        
        // The profile data returned from Supabase
        const typedProfile = profile as ProfileRow;
        
        // Get commission data or use defaults
        let commissionRate = 50;
        let commissionRules: any[] = [];
        let commissionFees: any[] = [];
        
        if (commissionData && commissionData.length > 0) {
          commissionRate = commissionData[0].base_rate;
          commissionRules = Array.isArray(commissionData[0].rules) ? commissionData[0].rules : [];
          commissionFees = Array.isArray(commissionData[0].fees) ? commissionData[0].fees : [];
        }
          
        // Convert profile to TeamMemberProfile format
        const memberProfile: TeamMemberProfile = {
          id: typedProfile.id,
          name: typedProfile.name || 'Unknown',
          email: `${typedProfile.name?.toLowerCase().replace(/\s+/g, '.')}@fixlyfy.com`,
          role: (typedProfile.role as any) || "technician",
          status: (typedProfile.status as "active" | "suspended") || "active",
          avatar: typedProfile.avatar_url || "https://github.com/shadcn.png",
          lastLogin: typedProfile.updated_at,
          isPublic: typedProfile.is_public !== false,
          availableForJobs: typedProfile.available_for_jobs !== false,
          phone: typedProfile.phone ? [typedProfile.phone] : [],
          twoFactorEnabled: typedProfile.two_factor_enabled || false,
          callMaskingEnabled: typedProfile.call_masking_enabled || false,
          laborCostPerHour: typedProfile.labor_cost_per_hour || 50,
          skills: skills || [],
          serviceAreas: serviceAreas || [],
          scheduleColor: typedProfile.schedule_color || "#6366f1",
          internalNotes: typedProfile.internal_notes || "",
          usesTwoFactor: typedProfile.uses_two_factor || false,
          // Add commission data
          commissionRate,
          commissionRules,
          commissionFees
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
  
  useEffect(() => {
    fetchTeamMember();
  }, [id]);

  return { member, isLoading, error, refetch: fetchTeamMember };
};
