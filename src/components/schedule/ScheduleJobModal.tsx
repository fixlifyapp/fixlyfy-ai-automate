
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { teamMembers } from "@/data/team";

interface ScheduleJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleJobModal = ({ open, onOpenChange }: ScheduleJobModalProps) => {
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>("09:00");
  const [duration, setDuration] = useState<string>("60");
  const [technician, setTechnician] = useState<string>("");
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  
  const handleSuggestTechnician = () => {
    setShowAISuggestion(true);
    // In a real app, this would call an AI service to get a suggestion
    setTimeout(() => {
      setTechnician("3"); // Michael Chen's ID
    }, 500);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Schedule New Job</DialogTitle>
          <DialogDescription>
            Create a new job and schedule it for a technician.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="client">Client</Label>
              <Input id="client" placeholder="Search or create client..." />
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="jobType">Job Type</Label>
              <Select>
                <SelectTrigger id="jobType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input 
                id="duration" 
                type="number" 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="date">Preferred Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="time">Start Time</Label>
              <Input 
                id="time" 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div className="col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="technician">Technician</Label>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-6 p-0"
                  onClick={handleSuggestTechnician}
                >
                  <Wand2 className="h-3.5 w-3.5 mr-1" />
                  Suggest
                </Button>
              </div>
              <Select value={technician} onValueChange={setTechnician}>
                <SelectTrigger id="technician">
                  <SelectValue placeholder="Assign technician" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(tech => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {showAISuggestion && (
                <div className="mt-2 p-2 text-xs border rounded bg-fixlyfy/10 border-fixlyfy/20">
                  <p className="font-medium text-fixlyfy">AI Suggestion:</p>
                  <p>Best Tech: Michael Chen (Available 9AM, nearby previous job, 5⭐ rating)</p>
                </div>
              )}
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add any additional notes..." />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Save & Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
