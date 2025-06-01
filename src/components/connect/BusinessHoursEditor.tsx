
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";

interface BusinessHoursEditorProps {
  businessHours: Record<string, { open: string; close: string; enabled: boolean }>;
  onBusinessHoursChange: (hours: Record<string, { open: string; close: string; enabled: boolean }>) => void;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const TIME_OPTIONS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export const BusinessHoursEditor = ({ businessHours, onBusinessHoursChange }: BusinessHoursEditorProps) => {
  const updateDaySchedule = (day: string, field: string, value: string | boolean) => {
    const updatedHours = {
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value
      }
    };
    onBusinessHoursChange(updatedHours);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Business Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = businessHours[day.key] || { open: '08:00', close: '17:00', enabled: true };
            
            return (
              <div key={day.key} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="w-20 font-medium">{day.label}</div>
                
                <Switch
                  checked={dayHours.enabled}
                  onCheckedChange={(enabled) => updateDaySchedule(day.key, 'enabled', enabled)}
                />
                
                {dayHours.enabled ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={dayHours.open}
                      onValueChange={(value) => updateDaySchedule(day.key, 'open', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <span className="text-muted-foreground">to</span>
                    
                    <Select
                      value={dayHours.close}
                      onValueChange={(value) => updateDaySchedule(day.key, 'close', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">Closed</span>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">AI Behavior:</p>
            <p>During business hours: Normal service and scheduling</p>
            <p>After hours: Emergency detection and priority routing</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
