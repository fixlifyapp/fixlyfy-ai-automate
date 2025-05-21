
import { Badge } from "@/components/ui/badge";
import { getStatusStyleClass } from "./utils";

interface PaymentStatusBadgeProps {
  status: string;
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const statusClass = getStatusStyleClass(status);
  
  return (
    <Badge 
      variant="outline" 
      className={statusClass}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
