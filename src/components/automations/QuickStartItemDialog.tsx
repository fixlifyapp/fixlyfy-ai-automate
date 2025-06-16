import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Mail, User, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";

interface QuickStartItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    title: string;
    icon: React.ElementType;
  };
}

export const QuickStartItemDialog = ({ open, onOpenChange, item }: QuickStartItemDialogProps) => {
  const [automationName, setAutomationName] = useState(item.title);
  const [triggerType, setTriggerType] = useState("time");
  const [actionType, setActionType] = useState("email");
  const [isActive, setIsActive] = useState(true);
  const [messageContent, setMessageContent] = useState("");
  
  const handleSave = () => {
    // Here you would implement the actual saving logic
    toast.success(`${automationName} has been created successfully.`);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-fixlyfy/10 rounded-full flex items-center justify-center">
              <item.icon className="text-fixlyfy" size={16} />
            </div>
            Configure {item.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="automation-name" className="text-right">
              Name
            </Label>
            <Input
              id="automation-name"
              value={automationName}
              onChange={(e) => setAutomationName(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trigger-type" className="text-right">
              Trigger
            </Label>
            <Select value={triggerType} onValueChange={setTriggerType}>
              <SelectTrigger className="col-span-3" id="trigger-type">
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Time-based</SelectItem>
                <SelectItem value="event">Event-based</SelectItem>
                <SelectItem value="status">Status change</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {triggerType === "time" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                When
              </Label>
              <div className="col-span-3 grid grid-cols-2 gap-4">
                <Select defaultValue="before">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before</SelectItem>
                    <SelectItem value="after">After</SelectItem>
                    <SelectItem value="on">On</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="1" className="w-16" />
                  <Select defaultValue="days">
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="action-type" className="text-right">
              Action
            </Label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="col-span-3" id="action-type">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Send email</SelectItem>
                <SelectItem value="sms">Send SMS</SelectItem>
                <SelectItem value="notification">Create notification</SelectItem>
                <SelectItem value="task">Create task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(actionType === "email" || actionType === "sms") && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="message-content" className="text-right pt-2">
                Message
              </Label>
              <Textarea
                id="message-content"
                placeholder="Enter your message content here..."
                className="col-span-3"
                rows={4}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is-active" className="text-right">
              Active
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="is-active" className="font-normal">
                {isActive ? "Automation is active" : "Automation is inactive"}
              </Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-fixlyfy hover:bg-fixlyfy/90">
            Save Automation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
