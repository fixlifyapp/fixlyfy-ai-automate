
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Camera } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PersonalInfoCardProps {
  userSettings: any;
  updateUserSettings: (updates: any) => void;
}

export const PersonalInfoCard = ({ userSettings, updateUserSettings }: PersonalInfoCardProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    notification_email: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user.id)
        .single();

      if (data) {
        const nameParts = data.name?.split(' ') || ['', ''];
        setProfile({
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          phone: data.phone || '',
          notification_email: userSettings.notification_email || user.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleFieldChange = async (field: string, value: string) => {
    if (!user) return;
    
    setIsLoading(true);
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);

    try {
      if (field === 'notification_email') {
        await updateUserSettings({ notification_email: value });
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: `${updatedProfile.first_name} ${updatedProfile.last_name}`.trim(),
            phone: updatedProfile.phone
          })
          .eq('id', user.id);

        if (error) throw error;
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="fixlyfy-card">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <User className="h-5 w-5 text-fixlyfy mr-2" />
        <CardTitle className="text-lg">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="text-lg">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="sm" 
              variant="outline" 
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              disabled={isLoading}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <h3 className="font-medium">{profile.first_name} {profile.last_name}</h3>
            <p className="text-sm text-fixlyfy-text-secondary">{user?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input 
              id="first-name" 
              value={profile.first_name}
              onChange={(e) => handleFieldChange('first_name', e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input 
              id="last-name" 
              value={profile.last_name}
              onChange={(e) => handleFieldChange('last_name', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            value={profile.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notification-email">Notification Email</Label>
          <Input 
            id="notification-email" 
            type="email" 
            value={profile.notification_email}
            onChange={(e) => handleFieldChange('notification_email', e.target.value)}
            placeholder="notifications@company.com"
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};
