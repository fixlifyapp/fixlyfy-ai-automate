
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Send, 
  RefreshCw, 
  Download 
} from 'lucide-react';
import { toast } from 'sonner';

interface EstimateActionsProps {
  estimateId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onConvert?: () => void;
}

export const EstimateActions = ({ 
  estimateId, 
  onEdit, 
  onDelete, 
  onConvert 
}: EstimateActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    try {
      // Mock sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Estimate sent successfully');
    } catch (error) {
      toast.error('Failed to send estimate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    toast.info('Download functionality coming soon');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSend} disabled={isLoading}>
          <Send className="h-4 w-4 mr-2" />
          Send
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onConvert}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Convert to Invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
