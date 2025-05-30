
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface CreateInvitationData {
  email: string;
  role: string;
  name?: string;
  phone?: string;
  service_area?: string;
}

export const useTeamInvitations = () => {
  const [loading, setLoading] = useState(false);

  const createInvitation = async (data: CreateInvitationData) => {
    setLoading(true);
    try {
      // First check rate limiting
      const { data: rateLimitCheck } = await supabase.functions.invoke('secure-auth', {
        body: {
          type: 'signup',
          identifier: data.email
        }
      });

      if (!rateLimitCheck?.success) {
        return { success: false, message: 'Rate limit exceeded. Please try again later.' };
      }

      // Create the invitation
      const { data: invitation, error } = await supabase
        .from('team_invitations')
        .insert({
          email: data.email,
          role: data.role,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        // Log security event for failed invitation
        await supabase.rpc('log_security_event', {
          p_action: 'team_invitation_failed',
          p_resource: 'team_invitations',
          p_details: { email: data.email, error: error.message }
        });

        throw error;
      }

      // Log successful invitation creation
      await supabase.rpc('log_security_event', {
        p_action: 'team_invitation_created',
        p_resource: 'team_invitations',
        p_details: { 
          email: data.email, 
          role: data.role,
          invitation_id: invitation.id 
        }
      });

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: data.email,
          subject: 'You\'re invited to join our team!',
          html: `
            <h2>Team Invitation</h2>
            <p>Hello${data.name ? ` ${data.name}` : ''},</p>
            <p>You've been invited to join our team as a ${data.role}.</p>
            <a href="${window.location.origin}/invite/accept?token=${invitation.token}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
            <p>This invitation will expire in 7 days.</p>
          `
        }
      });

      if (emailError) {
        console.error('Failed to send invitation email:', emailError);
        toast.error('Invitation created but email failed to send');
      }

      return { success: true, data: invitation };
    } catch (error) {
      console.error('Error creating invitation:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create invitation' 
      };
    } finally {
      setLoading(false);
    }
  };

  const getInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching invitations:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch invitations' 
      };
    }
  };

  const updateInvitationStatus = async (invitationId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) throw error;

      // Log status change
      await supabase.rpc('log_security_event', {
        p_action: 'team_invitation_status_changed',
        p_resource: 'team_invitations',
        p_details: { 
          invitation_id: invitationId, 
          new_status: status 
        }
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error updating invitation status:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update invitation' 
      };
    }
  };

  return {
    createInvitation,
    getInvitations,
    updateInvitationStatus,
    loading
  };
};
