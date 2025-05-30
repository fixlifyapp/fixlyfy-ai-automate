
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface PersonalInfoSectionProps {
  userSettings: any;
  updateUserSettings: (updates: any) => void;
  isEditing?: boolean;
}

export const PersonalInfoSection = ({ userSettings, updateUserSettings, isEditing = true }: PersonalInfoSectionProps) => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="h-32 w-32">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>TC</AvatarFallback>
          </Avatar>
          {isEditing && <Button variant="outline" size="sm">Change Avatar</Button>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input id="first-name" defaultValue="Tom" disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input id="last-name" defaultValue="Cook" disabled={!isEditing} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={user?.email || "tom.cook@example.com"}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" defaultValue="(555) 987-6543" disabled={!isEditing} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notification-email">Notification Email</Label>
            <Input 
              id="notification-email" 
              type="email" 
              value={userSettings.notification_email || user?.email || ""}
              onChange={(e) => updateUserSettings({ notification_email: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
