
import { getPortalDomain, validatePortalDomain } from '../../../src/utils/security.ts';

export const generatePortalLink = async (
  clientEmail: string,
  jobId: string,
  supabaseAdmin: any
): Promise<string> => {
  if (!clientEmail) {
    return '';
  }

  try {
    console.log('Generating client portal login token for:', clientEmail);
    
    // First ensure client portal user exists
    const { data: existingPortalUser, error: portalUserError } = await supabaseAdmin
      .from('client_portal_users')
      .select('*')
      .eq('email', clientEmail)
      .single();

    if (portalUserError && portalUserError.code === 'PGRST116') {
      // Create client portal user if doesn't exist
      const { error: createError } = await supabaseAdmin
        .from('client_portal_users')
        .insert({
          email: clientEmail,
          is_active: true
        });

      if (createError) {
        console.error('Error creating client portal user:', createError);
      } else {
        console.log('Created client portal user for:', clientEmail);
      }
    }

    // Generate login token
    const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
      p_email: clientEmail
    });
    
    if (tokenData && !tokenError) {
      // Always use hub.fixlify.app for portal links
      const portalDomain = 'https://hub.fixlify.app';
      
      // Validate the portal domain
      if (!validatePortalDomain(portalDomain)) {
        console.error('Invalid portal domain:', portalDomain);
        return '';
      }
      
      const portalLink = `${portalDomain}/portal/login?token=${tokenData}&jobId=${jobId}`;
      console.log('Generated portal link:', portalLink.substring(0, 50) + '...');
      return portalLink;
    } else {
      console.error('Failed to generate portal login token:', tokenError);
      return '';
    }
  } catch (error) {
    console.error('Error generating portal link:', error);
    return '';
  }
};
