
export const generatePortalLink = async (
  clientEmail: string,
  jobId: string,
  estimateId: string,
  supabaseAdmin: any
): Promise<string> => {
  if (!clientEmail) {
    return '';
  }

  try {
    console.log('Generating client portal access token for:', clientEmail, 'estimate:', estimateId);
    
    // Generate access token for estimate
    const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_access_token', {
      p_email: clientEmail,
      p_resource_type: 'estimate',
      p_resource_id: estimateId
    });
    
    if (tokenData && !tokenError) {
      const portalDomain = 'https://hub.fixlify.app';
      const portalLink = `${portalDomain}/portal/login?token=${tokenData}&jobId=${jobId}`;
      console.log('Generated portal link for estimate');
      return portalLink;
    } else {
      console.error('Failed to generate portal access token:', tokenError);
      return '';
    }
  } catch (error) {
    console.error('Error generating portal link:', error);
    return '';
  }
};
