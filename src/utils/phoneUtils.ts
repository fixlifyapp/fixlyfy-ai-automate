
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (10-15 digits)
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return false;
  }
  
  // Basic US phone number validation (can be expanded for international)
  const usPhoneRegex = /^(\+?1)?[2-9]\d{9}$/;
  return usPhoneRegex.test(cleanPhone) || cleanPhone.length >= 10;
};

export const formatPhoneForTelnyx = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // If it doesn't start with country code, assume US (+1)
  if (cleanPhone.length === 10) {
    cleanPhone = '1' + cleanPhone;
  }
  
  // Add + prefix
  return '+' + cleanPhone;
};

export const formatPhoneDisplay = (phone: string): string => {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  }
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    const withoutCountryCode = cleanPhone.slice(1);
    return `+1 (${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6)}`;
  }
  
  return phone; // Return original if can't format
};
