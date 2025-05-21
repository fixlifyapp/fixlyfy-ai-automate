
import { PaymentMethod } from "@/types/payment";
import { CreditCard, DollarSign, FileText } from "lucide-react";
import React from "react";

/**
 * Returns the appropriate icon for each payment method
 */
export const getMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case "credit-card":
      return <CreditCard size={16} className="text-blue-500" />;
    case "cash":
      return <DollarSign size={16} className="text-green-500" />;
    case "e-transfer":
      return <FileText size={16} className="text-purple-500" />; 
    case "cheque":
      return <FileText size={16} className="text-orange-500" />;
    default:
      return <CreditCard size={16} />;
  }
};

/**
 * Returns the styled badge for each payment status
 */
export const getStatusStyleClass = (status: string) => {
  const statusStyles = {
    paid: "bg-green-50 text-green-700 border-green-200",
    refunded: "bg-amber-50 text-amber-700 border-amber-200",
    disputed: "bg-red-50 text-red-700 border-red-200"
  };
  
  return statusStyles[status as keyof typeof statusStyles] || "";
};
