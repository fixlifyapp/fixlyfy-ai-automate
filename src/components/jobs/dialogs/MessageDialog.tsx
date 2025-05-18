
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    name: string;
    phone?: string;  // Added phone as optional property
  };
}

export const MessageDialog = ({ open, onOpenChange, client }: MessageDialogProps) => {
  const [message, setMessage] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message History with {client.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="h-64 overflow-y-auto border rounded-md p-3 mb-4 space-y-3">
            <div className="flex flex-col max-w-[80%]">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">Hello! Just confirming our appointment tomorrow at 1:30 PM.</p>
              </div>
              <span className="text-xs text-fixlyfy-text-secondary mt-1">You, May 14 9:30 AM</span>
            </div>
            
            <div className="flex flex-col max-w-[80%] self-end items-end ml-auto">
              <div className="bg-fixlyfy text-white p-3 rounded-lg">
                <p className="text-sm">Yes, I'll be there. Thank you for the reminder.</p>
              </div>
              <span className="text-xs text-fixlyfy-text-secondary mt-1">{client.name}, May 14 10:15 AM</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <textarea 
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none" 
              placeholder="Type your message..."
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={() => {
              toast.success("Message sent to client");
              setMessage("");
            }}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
