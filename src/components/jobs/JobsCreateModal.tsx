
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
import { CalendarIcon, Loader2, Paperclip, Plus, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Job, useJobs } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { Client } from "@/hooks/useClients";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { globalTags } from "@/data/tags";
import { useNavigate } from "react-router-dom";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useJobTypes } from "@/hooks/useConfigItems";

interface JobsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedClientId?: string;
  onSuccess?: (job: Job) => void;
}

interface JobFormData {
  title: string;
  description: string;
  client_id: string;
  service: string;
  tags: string[];
  priority: string;
  date: Date;
  time: string;
  technician_id: string;
}

export const JobsCreateModal = ({
  open,
  onOpenChange,
  preselectedClientId,
  onSuccess
}: JobsCreateModalProps) => {
  const { addJob } = useJobs();
  const { clients, isLoading: isLoadingClients } = useClients();
  const { technicians, isLoading: isLoadingTechnicians } = useTechnicians();
  const { items: jobTypes, isLoading: isLoadingJobTypes } = useJobTypes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeValue, setTimeValue] = useState<string>("09:00");
  const [attachments, setAttachments] = useState<File[]>([]);
  const navigate = useNavigate();

  const form = useForm<JobFormData>({
    defaultValues: {
      title: "",
      description: "",
      client_id: preselectedClientId || "",
      service: "",
      tags: [],
      priority: "medium",
      date: new Date(),
      time: "09:00",
      technician_id: "unassigned"
    }
  });

  // Set preselected client when modal opens or preselectedClientId changes
  useEffect(() => {
    if (open && preselectedClientId) {
      form.setValue("client_id", preselectedClientId);
    }
  }, [open, preselectedClientId, form]);

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    form.reset();
    setDate(new Date());
    setTimeValue("09:00");
    setSelectedTags([]);
    setAttachments([]);
  };

  const handleSubmit = async (data: JobFormData) => {
    if (!data.client_id) {
      toast.error("Please select a client");
      return;
    }

    try {
      setIsSubmitting(true);

      // Format the scheduled date by combining the date and time
      const scheduledDate = date ? new Date(date) : new Date();
      const [hours, minutes] = timeValue.split(':').map(Number);
      scheduledDate.setHours(hours);
      scheduledDate.setMinutes(minutes);

      // Create the job object with proper data types
      const jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'> = {
        title: data.title || `${data.service || 'General'} Service`,
        description: data.description,
        status: "scheduled",
        client_id: data.client_id,
        service: data.service || "General Service",
        // Only set technician_id if it's not "unassigned" and is a valid UUID format
        technician_id: data.technician_id && data.technician_id !== "unassigned" ? data.technician_id : undefined,
        schedule_start: scheduledDate.toISOString(),
        schedule_end: new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        date: scheduledDate.toISOString(),
        revenue: 0,
        tags: selectedTags
      };

      console.log('Creating job with properly formatted data:', jobData);

      // Add the job using the useJobs hook
      const newJob = await addJob(jobData);
      
      if (newJob) {
        toast.success(`Job created successfully: ${newJob.id}`);

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(newJob);
        }

        // Navigate to the job details page
        navigate(`/jobs/${newJob.id}`);

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

  const selectedClient = preselectedClientId ? 
    clients.find(client => client.id === preselectedClientId) : 
    null;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new service job.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information Section */}
            <div className="md:col-span-2 p-4 border rounded-lg space-y-4">
              <h3 className="text-lg font-semibold">Client Information</h3>
              
              {/* Client Selection */}
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select 
                  value={form.watch("client_id")} 
                  onValueChange={(value) => form.setValue("client_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingClients ? (
                      <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                    ) : (
                      clients.map((client: Client) => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Client Contact Info - Show if a client is selected */}
              {selectedClient && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  {selectedClient.phone && (
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm">{selectedClient.phone}</p>
                    </div>
                  )}
                  {selectedClient.email && (
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm">{selectedClient.email}</p>
                    </div>
                  )}
                  {(selectedClient.address || selectedClient.city || selectedClient.state) && (
                    <div className="md:col-span-2">
                      <Label>Address</Label>
                      <p className="text-sm">
                        {[
                          selectedClient.address, 
                          selectedClient.city, 
                          selectedClient.state, 
                          selectedClient.zip
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Job Details Section */}
            <div className="md:col-span-2 p-4 border rounded-lg space-y-4">
              <h3 className="text-lg font-semibold">Job Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Type */}
                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type</Label>
                  <Select 
                    value={form.watch("service")} 
                    onValueChange={(value) => form.setValue("service", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingJobTypes ? (
                        <SelectItem value="loading" disabled>Loading job types...</SelectItem>
                      ) : jobTypes.length > 0 ? (
                        jobTypes.map((jobType) => (
                          <SelectItem key={jobType.id} value={jobType.name}>{jobType.name}</SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="HVAC">HVAC Repair</SelectItem>
                          <SelectItem value="Plumbing">Plumbing</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Installation">Installation</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={form.watch("priority")} 
                    onValueChange={(value) => form.setValue("priority", value)}
                  >
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
                
                {/* Job Title */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Brief title for the job" 
                    value={form.watch("title")} 
                    onChange={(e) => form.setValue("title", e.target.value)} 
                  />
                </div>
                
                {/* Job Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the job details, customer requirements, etc." 
                    value={form.watch("description")} 
                    onChange={(e) => form.setValue("description", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            {/* Scheduling Section */}
            <div className="md:col-span-2 p-4 border rounded-lg space-y-4">
              <h3 className="text-lg font-semibold">Schedule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
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
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Time */}
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={timeValue}
                    onChange={(e) => setTimeValue(e.target.value)}
                  />
                </div>
                
                {/* Technician */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="technician">Technician</Label>
                  <Select 
                    value={form.watch("technician_id")} 
                    onValueChange={(value) => form.setValue("technician_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {isLoadingTechnicians ? (
                        <SelectItem value="loading" disabled>Loading technicians...</SelectItem>
                      ) : (
                        technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Tags Section */}
            <div className="md:col-span-2 p-4 border rounded-lg space-y-4">
              <h3 className="text-lg font-semibold">Tags & Attachments</h3>
              
              <div className="space-y-4">
                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        {tag}
                        <X 
                          size={14} 
                          className="cursor-pointer" 
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={handleAddTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {globalTags.map(tag => (
                        <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Attachments */}
                <div className="space-y-2">
                  <Label htmlFor="attachments">Attachments</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((file, index) => (
                        <Badge 
                          key={index} 
                          variant="outline"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          <Paperclip size={14} />
                          {file.name}
                          <X 
                            size={14} 
                            className="cursor-pointer" 
                            onClick={() => handleRemoveFile(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="attachments"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Label 
                        htmlFor="attachments" 
                        className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-muted"
                      >
                        <Paperclip size={16} />
                        Attach Files
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Job'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
