
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate: string;
  initialTimeWindow: string;
  onSave: (date: string, timeWindow: string) => void;
}

export function ScheduleSelectionDialog({
  open,
  onOpenChange,
  initialDate,
  initialTimeWindow,
  onSave,
}: ScheduleSelectionDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : undefined
  );
  const [startTime, setStartTime] = useState(initialTimeWindow.split(" - ")[0] || "09:00");
  const [endTime, setEndTime] = useState(initialTimeWindow.split(" - ")[1] || "11:00");
  
  const handleSave = () => {
    const formattedDate = selectedDate 
      ? format(selectedDate, "MMM dd, yyyy") 
      : "Not scheduled";
    const timeWindow = `${startTime} - ${endTime}`;
    
    onSave(formattedDate, timeWindow);
    onOpenChange(false);
    toast.success("Job schedule updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Job</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal mt-2",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <div className="flex items-center mt-2">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <div className="flex items-center mt-2">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
