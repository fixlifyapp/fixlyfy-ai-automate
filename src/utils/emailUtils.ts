
export const generateFromEmail = (companyName: string): string => {
  // Generate a clean email format from company name
  const cleanName = companyName
    .toLowerCase()
    .trim()
    .replace(/[\s\-&+.,()]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 30);
  
  return `${cleanName || 'support'}@fixlify.app`;
};

export const formatCompanyNameForEmail = (companyName: string): string => {
  // Format company name for email display (clean but readable)
  if (!companyName || typeof companyName !== 'string') {
    return 'support';
  }

  return companyName
    .toLowerCase()
    .trim()
    .replace(/[\s\-&+.,()]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 30)
    || 'support';
};

export const formatEmailPreview = (content: string, maxLength: number = 100): string => {
  if (!content) return 'No content';
  
  // Strip HTML tags
  const textContent = content.replace(/<[^>]*>/g, '');
  
  // Truncate if necessary
  if (textContent.length > maxLength) {
    return textContent.substring(0, maxLength) + '...';
  }
  
  return textContent;
};

export const getEmailStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'bg-fixlyfy-success/20 text-fixlyfy-success';
    case 'sent':
      return 'bg-fixlyfy-info/20 text-fixlyfy-info';
    case 'failed':
      return 'bg-fixlyfy-error/20 text-fixlyfy-error';
    case 'pending':
      return 'bg-fixlyfy-warning/20 text-fixlyfy-warning';
    default:
      return 'bg-fixlyfy-text-muted/20 text-fixlyfy-text-muted';
  }
};

// Validate that two companies don't have conflicting email addresses
export const checkEmailAddressConflict = async (companyName: string, excludeUserId?: string) => {
  const proposedEmail = generateFromEmail(companyName);
  
  // This would be used in a validation function to check against existing companies
  // Implementation would depend on your specific validation requirements
  
  return {
    email: proposedEmail,
    hasConflict: false, // Would check against database in real implementation
    conflictsWith: null
  };
};

// Parse email address to extract company identifier
export const parseFixlifyEmail = (emailAddress: string) => {
  const [localPart, domain] = emailAddress.split('@');
  
  return {
    localPart: localPart?.toLowerCase(),
    domain: domain?.toLowerCase(),
    isFixlifyEmail: domain?.toLowerCase() === 'fixlify.app',
    companyIdentifier: localPart?.toLowerCase()
  };
};
