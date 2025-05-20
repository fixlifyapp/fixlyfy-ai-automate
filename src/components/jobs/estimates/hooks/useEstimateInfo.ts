
// This file handles the data for client and company info

export interface ClientInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface CompanyInfo {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  legalText: string;
}

export const useEstimateInfo = () => {
  // Get client information
  const getClientInfo = (): ClientInfo => {
    // In a real app, this would come from job data
    return {
      name: "Client Name",
      address: "123 Client St",
      phone: "(555) 555-5555",
      email: "client@example.com"
    };
  };
  
  // Get company information
  const getCompanyInfo = (): CompanyInfo => {
    // In a real app, this would come from company settings
    return {
      name: "Your Company",
      logo: "",
      address: "456 Company Ave",
      phone: "(555) 123-4567",
      email: "company@example.com",
      legalText: "Standard terms and conditions apply."
    };
  };

  return {
    getClientInfo,
    getCompanyInfo
  };
};
