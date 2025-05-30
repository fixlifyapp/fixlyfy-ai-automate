
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyTabContentProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyTabContent = ({ message, actionLabel, onAction }: EmptyTabContentProps) => {
  return (
    <Card className="p-6 flex flex-col items-center justify-center py-12">
      <p className="text-fixlify-text-secondary mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button 
          className="bg-fixlify hover:bg-fixlify/90" 
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};
