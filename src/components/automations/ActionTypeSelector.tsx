
import { Mail, MessageSquare, Phone, Bell, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ActionTypeSelectorProps {
  selectedType: string | null;
  onTypeSelect: (type: string) => void;
}

export const ActionTypeSelector = ({ selectedType, onTypeSelect }: ActionTypeSelectorProps) => {
  const actionTypes = [
    {
      id: "email",
      name: "Send Email",
      description: "Send an automated email",
      icon: Mail,
      color: "text-blue-500"
    },
    {
      id: "sms",
      name: "Send SMS",
      description: "Send a text message via Twilio",
      icon: MessageSquare,
      color: "text-green-500"
    },
    {
      id: "call",
      name: "Make Call",
      description: "Initiate a phone call via Twilio",
      icon: Phone,
      color: "text-purple-500"
    },
    {
      id: "notification",
      name: "Send Notification",
      description: "Create an internal notification",
      icon: Bell,
      color: "text-orange-500"
    },
    {
      id: "task",
      name: "Create Task",
      description: "Generate a task for team members",
      icon: Zap,
      color: "text-fixlyfy"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {actionTypes.map((actionType) => (
        <Card
          key={actionType.id}
          className={`p-4 cursor-pointer transition-all hover:shadow-md ${
            selectedType === actionType.id
              ? "border-fixlyfy bg-fixlyfy/5"
              : "border-fixlyfy-border hover:border-fixlyfy/60"
          }`}
          onClick={() => onTypeSelect(actionType.id)}
        >
          <div className="flex items-start">
            <div className="bg-white p-2 rounded border">
              <actionType.icon size={16} className={actionType.color} />
            </div>
            <div className="ml-3 flex-1">
              <h4 className="font-medium text-sm">{actionType.name}</h4>
              <p className="text-xs text-fixlyfy-text-secondary mt-1">
                {actionType.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
