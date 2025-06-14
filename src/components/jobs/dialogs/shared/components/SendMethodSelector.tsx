
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare } from "lucide-react";

interface SendMethodSelectorProps {
  sendMethod: "email" | "sms";
  onSendMethodChange: (value: "email" | "sms") => void;
}

export const SendMethodSelector = ({
  sendMethod,
  onSendMethodChange
}: SendMethodSelectorProps) => {
  return (
    <div>
      <Label htmlFor="sendMethod">Send Method</Label>
      <Select value={sendMethod} onValueChange={onSendMethodChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="email">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </div>
          </SelectItem>
          <SelectItem value="sms">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              SMS
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
