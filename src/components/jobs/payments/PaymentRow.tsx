
import { TableCell, TableRow } from "@/components/ui/table";
import { Payment } from "@/hooks/payments";
import { formatDistanceToNow } from "date-fns";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentActions } from "./PaymentActions";
import { getMethodIcon } from "./utils";
import React from "react";

interface PaymentRowProps {
  payment: Payment;
  onRefund: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

export const PaymentRow = ({ payment, onRefund, onDelete }: PaymentRowProps) => {
  const iconData = getMethodIcon(payment.method);
  const IconComponent = iconData.icon;
  
  return (
    <TableRow key={payment.id}>
      <TableCell>
        <div>
          {new Date(payment.date).toLocaleDateString()}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(payment.date), { addSuffix: true })}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <IconComponent size={iconData.size} className={iconData.className} />
          <span className="capitalize">{payment.method.replace('-', ' ')}</span>
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs">
        {payment.reference || "—"}
      </TableCell>
      <TableCell className="font-medium">
        ${payment.amount.toFixed(2)}
      </TableCell>
      <TableCell>
        <PaymentStatusBadge status={payment.status} />
      </TableCell>
      <TableCell className="text-right">
        <PaymentActions 
          payment={payment}
          onRefund={onRefund}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};
