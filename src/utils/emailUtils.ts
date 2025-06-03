
/**
 * Utility functions for email formatting and generation
 */

/**
 * Converts a company name to an email-safe format
 * Examples:
 * "Fixlify AI" -> "fixlify_ai"
 * "Bob's Plumbing & HVAC" -> "bobs_plumbing_hvac"
 * "ABC-123 Services LLC" -> "abc_123_services_llc"
 */
export const formatCompanyNameForEmail = (companyName: string): string => {
  if (!companyName || typeof companyName !== 'string') {
    return 'support';
  }

  return companyName
    .toLowerCase()
    .trim()
    // Replace spaces and common separators with underscores
    .replace(/[\s\-&+.,()]+/g, '_')
    // Remove any characters that aren't letters, numbers, or underscores
    .replace(/[^a-z0-9_]/g, '')
    // Remove multiple consecutive underscores
    .replace(/_+/g, '_')
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, '')
    // Limit length to 30 characters for reasonable email addresses
    .substring(0, 30)
    // Fallback if result is empty
    || 'support';
};

/**
 * Generates the FROM email address based on company name
 */
export const generateFromEmail = (companyName: string): string => {
  const formattedName = formatCompanyNameForEmail(companyName);
  return `${formattedName}@fixlify.app`;
};

/**
 * Generates professional subject lines for estimates and invoices
 */
export const generateEmailSubject = (
  companyName: string,
  documentType: 'estimate' | 'invoice',
  documentNumber: string
): string => {
  const cleanCompanyName = companyName?.trim() || 'Fixlify Services';
  const capitalizedType = documentType.charAt(0).toUpperCase() + documentType.slice(1);
  return `[${cleanCompanyName}] - ${capitalizedType} #${documentNumber}`;
};

/**
 * Gets the FROM name for emails (company name or fallback)
 */
export const generateFromName = (companyName: string, fallback: string = 'Support Team'): string => {
  return companyName?.trim() || fallback;
};
