
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface JobInfo {
  id: string;
  clientId: string;
  client: string;
  service: string;
  address: string;
  phone: string;
  email: string;
  total: number;
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  legalText: string;
}

export const useJobDetailsHeader = (id: string) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("scheduled");
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isEstimateDialogOpen, setIsEstimateDialogOpen] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [estimateAmount, setEstimateAmount] = useState(0);
  const [paymentsMade, setPaymentsMade] = useState<number[]>([]);
  const [hasEstimate, setHasEstimate] = useState(false);
  
  const getJobInfo = () => {
    // In a real app, this would fetch job details from API
    return {
      id: id,
      clientId: "client-123",
      client: "Michael Johnson",
      service: "HVAC Repair",
      address: "123 Main St, Apt 45",
      phone: "(555) 123-4567",
      email: "michael.johnson@example.com",
      total: 475.99,
      companyName: "Fixlyfy Services",
      companyLogo: "/placeholder.svg",
      companyAddress: "456 Business Ave, Suite 789",
      companyPhone: "(555) 987-6543",
      companyEmail: "info@fixlyfy.com",
      legalText: "All services are subject to our terms and conditions. Payment due within 30 days."
    };
  };
  
  const job = getJobInfo();

  // Calculate balance based on invoice amount minus payments
  // Note: Estimates don't affect the balance
  const balance = invoiceAmount - paymentsMade.reduce((total, payment) => total + payment, 0);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    toast.success(`Job status updated to ${newStatus}`);
  };

  const handleEditClient = () => {
    navigate(`/clients/${job.clientId}`);
  };

  const handleInvoiceCreated = (amount: number) => {
    setInvoiceAmount(amount);
    toast.success(`Invoice created for $${amount.toFixed(2)}`);
  };

  const handleEstimateCreated = (amount: number) => {
    setEstimateAmount(amount);
    setHasEstimate(true);
    toast.success(`Estimate created for $${amount.toFixed(2)}`);
  };

  const handleSyncEstimateToInvoice = () => {
    setInvoiceAmount(estimateAmount);
    toast.success(`Estimate of $${estimateAmount.toFixed(2)} synced to invoice successfully`);
  };

  return {
    job,
    status,
    balance,
    invoiceAmount,
    estimateAmount,
    hasEstimate,
    isCallDialogOpen,
    setIsCallDialogOpen,
    isMessageDialogOpen,
    setIsMessageDialogOpen,
    isInvoiceDialogOpen,
    setIsInvoiceDialogOpen,
    isEstimateDialogOpen,
    setIsEstimateDialogOpen,
    handleStatusChange,
    handleEditClient,
    handleInvoiceCreated,
    handleEstimateCreated,
    handleSyncEstimateToInvoice
  };
};
