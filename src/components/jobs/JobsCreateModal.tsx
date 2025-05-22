import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Job, useJobs } from "@/hooks/useJobs";
import { supabase } from "@/integrations/supabase/client";
import { useClients } from "@/hooks/useClients";
import { Client } from "@/hooks/useClients";
interface JobsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedClientId?: string;
  onSuccess?: (job: Job) => void;
}
export const JobsCreateModal = ({
  open,
  onOpenChange,
  preselectedClientId,
  onSuccess
}: JobsCreateModalProps) => {
  const {
    addJob
  } = useJobs();
  const {
    clients,
    isLoading: isLoadingClients
  } = useClients();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [serviceArea, setServiceArea] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");
  const [technician, setTechnician] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [timeValue, setTimeValue] = useState<string>("09:00");
  const [items, setItems] = useState<{
    name: string;
    quantity: number;
    price: number;
  }[]>([{
    name: "",
    quantity: 1,
    price: 0
  }]);

  // Set preselected client when modal opens or preselectedClientId changes
  useEffect(() => {
    if (open && preselectedClientId) {
      setSelectedClient(preselectedClientId);
    }
  }, [open, preselectedClientId]);
  const handleAddItem = () => {
    setItems([...items, {
      name: "",
      quantity: 1,
      price: 0
    }]);
  };
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };
  const handleItemChange = (index: number, field: keyof typeof items[0], value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setItems(newItems);
  };
  const resetForm = () => {
    setDate(new Date());
    setSelectedClient(preselectedClientId || "");
    setJobType("");
    setServiceArea("");
    setPriority("medium");
    setTechnician("");
    setDescription("");
    setTimeValue("09:00");
    setItems([{
      name: "",
      quantity: 1,
      price: 0
    }]);
  };
  const handleSubmit = async () => {
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }
    try {
      setIsSubmitting(true);

      // Calculate total revenue from items
      const revenue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Format the scheduled date by combining the date and time
      const scheduledDate = date ? new Date(date) : new Date();
      const [hours, minutes] = timeValue.split(':').map(Number);
      scheduledDate.setHours(hours);
      scheduledDate.setMinutes(minutes);

      // Create the job object
      const jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'> = {
        title: jobType ? `${jobType} Service` : "New Service Job",
        description: description,
        status: "scheduled",
        client_id: selectedClient,
        service: jobType,
        technician_id: technician || undefined,
        schedule_start: scheduledDate.toISOString(),
        schedule_end: new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        // 2 hours duration by default
        date: scheduledDate.toISOString(),
        revenue: revenue,
        tags: serviceArea ? [serviceArea, priority] : [priority]
      };

      // Add the job using the useJobs hook
      const newJob = await addJob(jobData);
      if (newJob) {
        toast.success(`Job created successfully: ${newJob.id}`);

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(newJob);
        }

        // Reset form and close modal
        resetForm();
        onOpenChange(false);
      } else {
        toast.error("Failed to create job");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Error creating job");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Dialog open={open} onOpenChange={newOpen => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new service job.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingClients ? <SelectItem value="loading" disabled>Loading clients...</SelectItem> : clients.map((client: Client) => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Service Area</Label>
              <Select value={serviceArea} onValueChange={setServiceArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">North District</SelectItem>
                  <SelectItem value="south">South District</SelectItem>
                  <SelectItem value="east">East District</SelectItem>
                  <SelectItem value="west">West District</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HVAC">HVAC Repair</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                <Input type="time" value={timeValue} onChange={e => setTimeValue(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="technician">Technician</Label>
              <Select value={technician} onValueChange={setTechnician}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="robert">Robert Smith</SelectItem>
                  <SelectItem value="john">John Doe</SelectItem>
                  <SelectItem value="emily">Emily Clark</SelectItem>
                  <SelectItem value="ai">AI Auto-assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe the job details, customer requirements, etc." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          
          
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" className="bg-fixlyfy hover:bg-fixlyfy/90" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </> : 'Create Job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};