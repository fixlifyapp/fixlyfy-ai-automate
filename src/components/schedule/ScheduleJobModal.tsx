
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
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";

interface ScheduleJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: (job: any) => Promise<any>;
  onSuccess?: (job: any) => void;
  preselectedClientId?: string;
}

interface FormData {
  title: string;
  client_id: string;
  description: string;
  schedule_start: string;
  technician_id: string;
  job_type: string;
  duration: string;
}

export const ScheduleJobModal = ({ 
  open, 
  onOpenChange, 
  onJobCreated, 
  onSuccess, 
  preselectedClientId 
}: ScheduleJobModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    client_id: preselectedClientId || "",
    description: "",
    schedule_start: "",
    technician_id: "",
    job_type: "",
    duration: "60",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const { clients, isLoading } = useClients();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleClientChange = (value: string) => {
    setFormData({ ...formData, client_id: value });
  };

  const handleTechnicianChange = (value: string) => {
    setFormData({ ...formData, technician_id: value });
  };

  const handleJobTypeChange = (value: string) => {
    setFormData({ ...formData, job_type: value });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      client_id: preselectedClientId || "",
      description: "",
      schedule_start: "",
      technician_id: "",
      job_type: "",
      duration: "60",
    });
    setShowAISuggestion(false);
  };

  const handleSuggestTechnician = () => {
    setShowAISuggestion(true);
    // In a real app, this would call an AI service to get a suggestion
    setTimeout(() => {
      setFormData({ ...formData, technician_id: "3" }); // Michael Chen's ID
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.client_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare job data for addJob function
      const jobData = {
        title: formData.title,
        client_id: formData.client_id,
        description: formData.description,
        date: formData.schedule_start || new Date().toISOString(),
        schedule_start: formData.schedule_start || undefined,
        technician_id: formData.technician_id || undefined,
        job_type: formData.job_type || 'General Service',
        status: 'scheduled',
        revenue: 0
      };

      if (onJobCreated) {
        const createdJob = await onJobCreated(jobData);
        
        if (createdJob && onSuccess) {
          onSuccess(createdJob);
        }
        
        onOpenChange(false);
        resetForm();
      } else {
        toast.error("Job creation function not available");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Job Title</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="Enter job title" 
                  required 
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="client_id">Client</Label>
                <Select onValueChange={handleClientChange} value={formData.client_id}>
                  <SelectTrigger id="client_id">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="" disabled>Loading clients...</SelectItem>
                    ) : (
                      clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="job_type">Job Type</Label>
                <Select onValueChange={handleJobTypeChange} value={formData.job_type}>
                  <SelectTrigger id="job_type">
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
                  value={formData.duration} 
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <Label htmlFor="schedule_start">Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.schedule_start && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.schedule_start ? (
                        format(new Date(formData.schedule_start), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.schedule_start ? new Date(formData.schedule_start) : undefined}
                      onSelect={(date) => setFormData({
                        ...formData,
                        schedule_start: date ? date.toISOString() : ""
                      })}
                      disabled={(date) => date < new Date()}
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
                  onChange={(e) => {
                    if (formData.schedule_start) {
                      const date = new Date(formData.schedule_start);
                      const [hours, minutes] = e.target.value.split(':');
                      date.setHours(parseInt(hours), parseInt(minutes));
                      setFormData({ ...formData, schedule_start: date.toISOString() });
                    }
                  }}
                />
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="technician_id">Technician</Label>
                  <Button 
                    type="button"
                    variant="link" 
                    size="sm" 
                    className="h-6 p-0"
                    onClick={handleSuggestTechnician}
                  >
                    <Wand2 className="h-3.5 w-3.5 mr-1" />
                    Suggest
                  </Button>
                </div>
                <Select value={formData.technician_id} onValueChange={handleTechnicianChange}>
                  <SelectTrigger id="technician_id">
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
                <Label htmlFor="description">Notes</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Add any additional notes..." 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Save & Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
