
interface PaymentSummaryProps {
  netAmount: number;
  totalRefunded: number;
}

export const PaymentSummary = ({ netAmount, totalRefunded }: PaymentSummaryProps) => {
  return (
    <div className="text-sm text-muted-foreground mt-1">
      <span className="font-medium">${netAmount.toFixed(2)}</span> net payments
      {totalRefunded > 0 && (
        <>
          {" • "}
          <span className="text-orange-500 font-medium">${totalRefunded.toFixed(2)} refunded</span>
        </>
      )}
    </div>
  );
};
