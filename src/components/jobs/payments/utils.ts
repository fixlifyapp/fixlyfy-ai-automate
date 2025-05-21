
import { PaymentMethod } from "@/types/payment";
import { CreditCard, DollarSign, FileText } from "lucide-react";
import React from "react";

/**
 * Returns the appropriate icon component for each payment method
 * This function returns the component type, not JSX, for type safety
 */
export const getMethodIcon = (method: PaymentMethod) => {
  const iconProps = { size: 16 };
  
  switch (method) {
    case "credit-card":
      return {
        icon: CreditCard,
        className: "text-blue-500",
        ...iconProps
      };
    case "cash":
      return {
        icon: DollarSign,
        className: "text-green-500",
        ...iconProps
      };
    case "e-transfer":
      return {
        icon: FileText,
        className: "text-purple-500",
        ...iconProps
      };
    case "cheque":
      return {
        icon: FileText,
        className: "text-orange-500",
        ...iconProps
      };
    default:
      return {
        icon: CreditCard,
        className: "",
        ...iconProps
      };
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
