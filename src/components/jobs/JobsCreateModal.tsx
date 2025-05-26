
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";

interface JobsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: (job: any) => Promise<void>;
  onSuccess?: (job: any) => void;
  preselectedClientId?: string;
}

interface FormData {
  title: string;
  client_id: string;
  description: string;
  schedule_start: string;
}

export const JobsCreateModal = ({ 
  open, 
  onOpenChange, 
  onJobCreated, 
  onSuccess, 
  preselectedClientId 
}: JobsCreateModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    client_id: preselectedClientId || "",
    description: "",
    schedule_start: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { clients, isLoading } = useClients();

  const generateJobId = () => {
    return "j" + Math.random().toString(36).substring(2, 9);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleClientChange = (value: string) => {
    setFormData({ ...formData, client_id: value });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      client_id: preselectedClientId || "",
      description: "",
      schedule_start: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.client_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newJob = {
        ...formData,
        id: generateJobId(),
        date: formData.schedule_start || new Date().toISOString(),
        revenue: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (onJobCreated) {
        await onJobCreated(newJob);
      }
      
      if (onSuccess) {
        onSuccess(newJob);
      }
      
      toast.success("Job created successfully!");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Create a new job and assign it to a client.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input 
                type="text" 
                id="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="Enter job title" 
                required 
              />
            </div>
            
            <div>
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
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Enter job description" 
                rows={4} 
              />
            </div>
            
            <div>
              <Label htmlFor="schedule_start">Schedule Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
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
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
