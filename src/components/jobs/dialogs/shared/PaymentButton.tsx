
import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PaymentButtonProps {
  invoiceId: string;
  jobId?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const PaymentButton = ({ 
  invoiceId, 
  jobId, 
  variant = "default", 
  size = "default",
  className = "" 
}: PaymentButtonProps) => {
  const navigate = useNavigate();

  const handlePayClick = () => {
    // Navigate to payment page with invoice ID
    if (jobId) {
      navigate(`/jobs/${jobId}?tab=payments&invoice=${invoiceId}`);
    } else {
      navigate(`/invoices/${invoiceId}?action=pay`);
    }
  };

  return (
    <Button
      onClick={handlePayClick}
      variant={variant}
      size={size}
      className={`${className} bg-green-600 hover:bg-green-700 text-white`}
    >
      <CreditCard className="h-4 w-4 mr-2" />
      Pay Invoice
    </Button>
  );
};
