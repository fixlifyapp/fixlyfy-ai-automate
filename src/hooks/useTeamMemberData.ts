
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
          // Fetch commission data if available
          const { data: commissionData } = await supabase
            .from('team_member_commissions')
            .select('*')
            .eq('user_id', id)
            .single()
            .catch(() => ({ data: null }));

          // Fetch skills if available
          const { data: skills } = await supabase
            .from('team_member_skills')
            .select('*')
            .eq('user_id', id)
            .catch(() => ({ data: [] }));

          // Fetch service areas if available
          const { data: serviceAreas } = await supabase
            .from('service_areas')
            .select('*')
            .eq('user_id', id)
            .catch(() => ({ data: [] }));
            
          // Convert profile to TeamMemberProfile format
          const memberProfile: TeamMemberProfile = {
            id: profile.id,
            name: profile.name || 'Unknown',
            email: profile.email || `${profile.name?.toLowerCase().replace(/\s+/g, '.')}@fixlyfy.com`,
            role: (profile.role as any) || "technician",
            status: profile.status || "active",
            avatar: profile.avatar_url || "https://github.com/shadcn.png",
            lastLogin: profile.updated_at,
            isPublic: profile.is_public !== false,
            availableForJobs: profile.available_for_jobs !== false,
            phone: profile.phone ? [profile.phone] : [],
            twoFactorEnabled: profile.two_factor_enabled || false,
            callMaskingEnabled: profile.call_masking_enabled || false,
            laborCostPerHour: profile.labor_cost_per_hour || 50,
            skills: skills || [],
            serviceAreas: serviceAreas || [],
            scheduleColor: profile.schedule_color || "#6366f1",
            internalNotes: profile.internal_notes || "",
            usesTwoFactor: profile.uses_two_factor || false,
            // Add commission data if available
            commissionRate: commissionData?.base_rate || 50,
            commissionRules: commissionData?.rules || [],
            commissionFees: commissionData?.fees || []
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

  return { member, isLoading, error, refetch: () => fetchTeamMember() };
};
