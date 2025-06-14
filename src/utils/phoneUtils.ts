
export const formatPhoneForTelnyx = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add +1 prefix if it doesn't start with 1
  if (cleaned.startsWith('1')) {
    return `+${cleaned}`;
  } else {
    return `+1${cleaned}`;
  }
};

export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  // Check if it's at least 10 digits (US phone number without country code)
  // or 11 digits (US phone number with country code)
  return cleaned.length >= 10 && cleaned.length <= 11;
};

export const formatPhoneForDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const withoutCountryCode = cleaned.slice(1);
    return `+1 (${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6)}`;
  }
  
  return phone; // Return original if format doesn't match
};
