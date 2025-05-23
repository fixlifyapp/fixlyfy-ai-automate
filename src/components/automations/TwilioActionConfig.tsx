
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, MessageSquare } from "lucide-react";

interface TwilioActionConfigProps {
  actionType: "sms" | "call";
  config: any;
  onChange: (config: any) => void;
}

export const TwilioActionConfig = ({ actionType, config, onChange }: TwilioActionConfigProps) => {
  const [phoneNumber, setPhoneNumber] = useState(config.phoneNumber || "");
  const [message, setMessage] = useState(config.message || "");
  const [messageTemplate, setMessageTemplate] = useState(config.messageTemplate || "custom");

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    onChange({ ...config, phoneNumber: value });
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    onChange({ ...config, message: value });
  };

  const handleTemplateChange = (value: string) => {
    setMessageTemplate(value);
    if (value !== "custom") {
      const templateMessage = getTemplateMessage(value);
      setMessage(templateMessage);
      onChange({ ...config, messageTemplate: value, message: templateMessage });
    } else {
      onChange({ ...config, messageTemplate: value });
    }
  };

  const getTemplateMessage = (template: string) => {
    const templates = {
      "appointment-reminder": "Hi {ClientName}, this is a reminder about your appointment on {JobDate} at {JobTime}. If you need to reschedule, please call us at {CompanyPhone}.",
      "payment-reminder": "Hello {ClientName}, your invoice #{InvoiceNumber} for ${InvoiceAmount} is due on {DueDate}. Please visit {PaymentLink} to pay online.",
      "job-completion": "Hi {ClientName}, we've completed your {ServiceType} service. Thank you for choosing us! Please leave a review at {ReviewLink}.",
      "follow-up": "Hi {ClientName}, how did we do with your recent {ServiceType} service? We'd love to hear your feedback!"
    };
    return templates[template as keyof typeof templates] || "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        {actionType === "sms" ? (
          <MessageSquare size={20} className="text-fixlyfy mr-2" />
        ) : (
          <Phone size={20} className="text-fixlyfy mr-2" />
        )}
        <h3 className="font-medium">
          {actionType === "sms" ? "SMS Configuration" : "Call Configuration"}
        </h3>
      </div>

      <div>
        <Label htmlFor="phone-number">Phone Number</Label>
        <Input
          id="phone-number"
          placeholder="e.g., +1234567890 or use {ClientPhone}"
          value={phoneNumber}
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          className="mt-1"
        />
        <p className="text-xs text-fixlyfy-text-secondary mt-1">
          Use variables like {`{ClientPhone}`} to dynamically insert client data
        </p>
      </div>

      {actionType === "sms" && (
        <>
          <div>
            <Label htmlFor="message-template">Message Template</Label>
            <Select value={messageTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointment-reminder">Appointment Reminder</SelectItem>
                <SelectItem value="payment-reminder">Payment Reminder</SelectItem>
                <SelectItem value="job-completion">Job Completion</SelectItem>
                <SelectItem value="follow-up">Follow-up Message</SelectItem>
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message Content</Label>
            <Textarea
              id="message"
              placeholder="Enter your SMS message..."
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
            <p className="text-xs text-fixlyfy-text-secondary mt-1">
              Available variables: {`{ClientName}, {JobDate}, {JobTime}, {CompanyPhone}, {InvoiceNumber}, {InvoiceAmount}, {DueDate}`}
            </p>
          </div>

          <div className="bg-fixlyfy/5 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Message Preview</h4>
            <p className="text-sm">
              {message.replace(/{(\w+)}/g, (match, key) => {
                const examples = {
                  ClientName: "John Doe",
                  JobDate: "March 15, 2024",
                  JobTime: "2:00 PM",
                  CompanyPhone: "(555) 123-4567",
                  InvoiceNumber: "INV-001",
                  InvoiceAmount: "150.00",
                  DueDate: "March 20, 2024"
                };
                return examples[key as keyof typeof examples] || match;
              })}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
