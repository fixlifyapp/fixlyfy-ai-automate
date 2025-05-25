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
import { CalendarIcon, Loader2, Paperclip, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Job } from "@/types/job";
import { useJobs } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useClients";
import { Client } from "@/hooks/useClients";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useJobTypes, useTags, useLeadSources } from "@/hooks/useConfigItems";
import { QuickAddJobTypeDialog } from "./quick-add/QuickAddJobTypeDialog";
import { QuickAddTagDialog } from "./quick-add/QuickAddTagDialog";
import { QuickAddLeadSourceDialog } from "./quick-add/QuickAddLeadSourceDialog";
import { useJobCustomFields } from "@/hooks/useJobCustomFields";
import { CustomFieldRenderer } from "./CustomFieldRenderer";
import { ClientsCreateModal } from "@/components/clients/ClientsCreateModal";
import { useJobAttachments } from "@/hooks/useJobAttachments";
import { PropertySelector } from "./PropertySelector";

interface JobsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedClientId?: string;
  onSuccess?: (job: Job) => void;
}

interface JobFormData {
  description: string;
  client_id: string;
  service: string;
  tags: string[];
  start_date: Date;
  start_time: string;
  end_date: Date;
  end_time: string;
  technician_id: string;
  tasks: string[];
  property_id: string;
}

export const JobsCreateModal = ({
  open,
  onOpenChange,
  preselectedClientId,
  onSuccess
}: JobsCreateModalProps) => {
  const { addJob } = useJobs();
  const { clients, isLoading: isLoadingClients, addClient } = useClients();
  const { technicians, isLoading: isLoadingTechnicians } = useTechnicians();
  const { items: jobTypes, isLoading: isLoadingJobTypes } = useJobTypes();
  const { items: tags, isLoading: isLoadingTags } = useTags();
  const { items: leadSources, isLoading: isLoadingLeadSources } = useLeadSources();
  const { availableFields, saveCustomFieldValues } = useJobCustomFields();
  const { uploadAttachments, isUploading } = useJobAttachments();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [endTime, setEndTime] = useState<string>("17:00");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  
  // Additional fields
  const [leadSource, setLeadSource] = useState<string>("");
  
  // Quick-add dialog states
  const [showJobTypeDialog, setShowJobTypeDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showLeadSourceDialog, setShowLeadSourceDialog] = useState(false);
  const [recentlyAddedJobType, setRecentlyAddedJobType] = useState<string | null>(null);
  const [recentlyAddedTag, setRecentlyAddedTag] = useState<string | null>(null);
  const [recentlyAddedClient, setRecentlyAddedClient] = useState<string | null>(null);
  const [recentlyAddedLeadSource, setRecentlyAddedLeadSource] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const form = useForm<JobFormData>({
    defaultValues: {
      description: "",
      client_id: preselectedClientId || "",
      service: "",
      tags: [],
      start_date: new Date(),
      start_time: "09:00",
      end_date: new Date(),
      end_time: "17:00",
      technician_id: "unassigned",
      tasks: [],
      property_id: ""
    }
  });

  // Set preselected client when modal opens or preselectedClientId changes
  useEffect(() => {
    if (open && preselectedClientId) {
      form.setValue("client_id", preselectedClientId);
    }
  }, [open, preselectedClientId, form]);

  // Reset property selection when client changes
  useEffect(() => {
    const clientId = form.watch("client_id");
    if (clientId !== preselectedClientId) {
      setSelectedPropertyId("");
    }
  }, [form.watch("client_id"), preselectedClientId]);

  // Auto-select recently added items
  useEffect(() => {
    if (recentlyAddedJobType) {
      form.setValue("service", recentlyAddedJobType);
      const timer = setTimeout(() => setRecentlyAddedJobType(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAddedJobType, form]);

  useEffect(() => {
    if (recentlyAddedTag && !selectedTags.includes(recentlyAddedTag)) {
      setSelectedTags(prev => [...prev, recentlyAddedTag]);
      const timer = setTimeout(() => setRecentlyAddedTag(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAddedTag, selectedTags]);

  useEffect(() => {
    if (recentlyAddedClient) {
      form.setValue("client_id", recentlyAddedClient);
      const timer = setTimeout(() => setRecentlyAddedClient(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [recentlyAddedClient, form]);

  // Initialize custom field values with default values
  useEffect(() => {
    if (open && availableFields.length > 0) {
      const defaultValues: Record<string, string> = {};
      availableFields.forEach(field => {
        defaultValues[field.id] = field.default_value || '';
      });
      setCustomFieldValues(defaultValues);
    }
  }, [open, availableFields]);

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleAddTask = () => {
    if (newTask.trim() && !tasks.includes(newTask.trim())) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask("");
    }
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
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
    setStartDate(new Date());
    setStartTime("09:00");
    setEndDate(new Date());
    setEndTime("17:00");
    setSelectedTags([]);
    setAttachments([]);
    setCustomFieldValues({});
    setTasks([]);
    setNewTask("");
    setLeadSource("");
    setSelectedPropertyId("");
    setRecentlyAddedJobType(null);
    setRecentlyAddedTag(null);
    setRecentlyAddedClient(null);
    setRecentlyAddedLeadSource(null);
  };

  const handleJobTypeAdded = (jobType: { id: string; name: string }) => {
    setRecentlyAddedJobType(jobType.name);
  };

  const handleTagAdded = (tag: { id: string; name: string }) => {
    setRecentlyAddedTag(tag.name);
  };

  const handleClientAdded = (client: Client) => {
    setRecentlyAddedClient(client.id);
    toast.success(`Client ${client.name} created successfully`);
  };

  const handleLeadSourceAdded = (leadSource: { id: string; name: string }) => {
    setRecentlyAddedLeadSource(leadSource.name);
  };

  const handleSubmit = async (data: JobFormData) => {
    if (!data.client_id) {
      toast.error("Please select a client");
      return;
    }

    // Validate required custom fields
    const requiredFields = availableFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => {
      const value = customFieldValues[field.id];
      return !value || value.trim() === '';
    });
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.map(f => f.name).join(', ')}`);
      return;
    }

    try {
      setIsSubmitting(true);

      // Format the scheduled dates
      const scheduledStartDate = startDate ? new Date(startDate) : new Date();
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      scheduledStartDate.setHours(startHours);
      scheduledStartDate.setMinutes(startMinutes);

      const scheduledEndDate = endDate ? new Date(endDate) : new Date();
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      scheduledEndDate.setHours(endHours);
      scheduledEndDate.setMinutes(endMinutes);

      // Create the job object with proper types - ensure tasks is an array for frontend
      const jobDataForDatabase = {
        id: `JOB-${Date.now()}`,
        title: `${data.service || 'General'} Service`,
        description: data.description,
        status: "scheduled",
        client_id: data.client_id,
        service: data.service || "General Service",
        technician_id: data.technician_id && data.technician_id !== "unassigned" ? data.technician_id : undefined,
        property_id: selectedPropertyId || undefined,
        schedule_start: scheduledStartDate.toISOString(),
        schedule_end: scheduledEndDate.toISOString(),
        date: scheduledStartDate.toISOString(),
        revenue: 0,
        tags: selectedTags,
        job_type: data.service || "General Service",
        lead_source: leadSource || undefined,
        tasks: tasks // Pass tasks as array for frontend, will be stringified in the hook
      };

      console.log('Creating job with database-compatible data:', jobDataForDatabase);

      const newJob = await addJob(jobDataForDatabase);
      
      if (newJob) {
        // Save custom field values if any
        if (Object.keys(customFieldValues).length > 0) {
          const nonEmptyValues = Object.fromEntries(
            Object.entries(customFieldValues).filter(([_, value]) => value && value.trim() !== '')
          );
          
          if (Object.keys(nonEmptyValues).length > 0) {
            await saveCustomFieldValues(newJob.id, nonEmptyValues);
          }
        }

        // Upload attachments if any
        if (attachments.length > 0) {
          await uploadAttachments(newJob.id, attachments);
        }
        
        toast.success(`Job created successfully: ${newJob.id}`);

        if (onSuccess) {
          onSuccess(newJob);
        }

        navigate(`/jobs/${newJob.id}`);
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

  const selectedClient = form.watch("client_id") ? 
    clients.find(client => client.id === form.watch("client_id")) : 
    null;

  const selectedClientId = form.watch("client_id");

  return (
    <>
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
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="client">Client</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClientDialog(true)}
                      className="h-6 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      New Client
                    </Button>
                  </div>
                  <Select 
                    value={form.watch("client_id")} 
                    onValueChange={(value) => form.setValue("client_id", value)}
                  >
                    <SelectTrigger className={cn(
                      recentlyAddedClient === form.watch("client_id") && "ring-2 ring-green-500"
                    )}>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingClients ? (
                        <SelectItem value="loading-clients" disabled>Loading clients...</SelectItem>
                      ) : clients.length > 0 ? (
                        clients.map((client: Client) => (
                          <SelectItem 
                            key={client.id} 
                            value={client.id || `client-${Math.random()}`}
                            className={cn(
                              recentlyAddedClient === client.id && "bg-green-50 border-green-200"
                            )}
                          >
                            {client.name}
                            {recentlyAddedClient === client.id && (
                              <span className="ml-2 text-xs text-green-600">(just added)</span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-clients" disabled>No clients available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Selection */}
                {selectedClientId && (
                  <PropertySelector
                    clientId={selectedClientId}
                    selectedPropertyId={selectedPropertyId}
                    onPropertySelect={setSelectedPropertyId}
                  />
                )}

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
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="jobType">Job Type</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowJobTypeDialog(true)}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <Select 
                      value={form.watch("service")} 
                      onValueChange={(value) => form.setValue("service", value)}
                    >
                      <SelectTrigger className={cn(
                        recentlyAddedJobType === form.watch("service") && "ring-2 ring-green-500"
                      )}>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingJobTypes ? (
                          <SelectItem value="loading-job-types" disabled>Loading job types...</SelectItem>
                        ) : jobTypes.length > 0 ? (
                          jobTypes.map((jobType) => (
                            <SelectItem 
                              key={jobType.id} 
                              value={jobType.name || `jobtype-${jobType.id}`}
                              className={cn(
                                recentlyAddedJobType === jobType.name && "bg-green-50 border-green-200"
                              )}
                            >
                              {jobType.name}
                              {recentlyAddedJobType === jobType.name && (
                                <span className="ml-2 text-xs text-green-600">(just added)</span>
                              )}
                            </SelectItem>
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
                  
                  {/* Lead Source */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="leadSource">Lead Source</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLeadSourceDialog(true)}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <Select 
                      value={leadSource} 
                      onValueChange={setLeadSource}
                    >
                      <SelectTrigger className={cn(
                        recentlyAddedLeadSource === leadSource && "ring-2 ring-green-500"
                      )}>
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingLeadSources ? (
                          <SelectItem value="loading-lead-sources" disabled>Loading lead sources...</SelectItem>
                        ) : leadSources.length > 0 ? (
                          leadSources
                            .filter(source => source.is_active)
                            .map((source) => (
                              <SelectItem 
                                key={source.id} 
                                value={source.name || `leadsource-${source.id}`}
                                className={cn(
                                  recentlyAddedLeadSource === source.name && "bg-green-50 border-green-200"
                                )}
                              >
                                {source.name}
                                {recentlyAddedLeadSource === source.name && (
                                  <span className="ml-2 text-xs text-green-600">(just added)</span>
                                )}
                              </SelectItem>
                            ))
                        ) : (
                          <>
                            <SelectItem value="Google">Google</SelectItem>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="Phone Call">Phone Call</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
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
                  {/* Start Date & Time */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  
                  {/* End Date & Time */}
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
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
                          <SelectItem value="loading-technicians" disabled>Loading technicians...</SelectItem>
                        ) : technicians.length > 0 ? (
                          technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id || `tech-${Math.random()}`}>
                              {tech.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-technicians" disabled>No technicians available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Tasks Section */}
              <div className="md:col-span-2 p-4 border rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">Tasks</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a task..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTask}
                      disabled={!newTask.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {tasks.length > 0 && (
                    <div className="space-y-2">
                      {tasks.map((task, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">{task}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTask(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Custom Fields Section */}
              {availableFields.length > 0 && (
                <div className="md:col-span-2 p-4 border rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableFields.map((field) => (
                      <CustomFieldRenderer
                        key={field.id}
                        field={field}
                        value={customFieldValues[field.id] || ''}
                        onChange={(value) => 
                          setCustomFieldValues(prev => ({
                            ...prev,
                            [field.id]: value
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tags & Attachments Section */}
              <div className="md:col-span-2 p-4 border rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">Tags & Attachments</h3>
                
                <div className="space-y-4">
                  {/* Tags */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tags">Tags</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTagDialog(true)}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedTags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline"
                          className={cn(
                            "flex items-center gap-1 px-2 py-1",
                            recentlyAddedTag === tag && "bg-green-50 border-green-200"
                          )}
                        >
                          {tag}
                          {recentlyAddedTag === tag && (
                            <span className="text-xs text-green-600">(new)</span>
                          )}
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
                        {isLoadingTags ? (
                          <SelectItem value="loading-tags" disabled>Loading tags...</SelectItem>
                        ) : tags.length > 0 ? (
                          tags.map(tag => (
                            <SelectItem 
                              key={tag.id} 
                              value={tag.name || `tag-${tag.id}`}
                              disabled={selectedTags.includes(tag.name || '')}
                            >
                              {tag.name}
                              {tag.category && tag.category !== 'General' && (
                                <span className="ml-2 text-xs text-muted-foreground">({tag.category})</span>
                              )}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                            <SelectItem value="Warranty">Warranty</SelectItem>
                            <SelectItem value="Follow-up">Follow-up</SelectItem>
                          </>
                        )}
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
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploading ? 'Uploading...' : 'Creating...'}
                  </>
                ) : (
                  'Create Job'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Quick Add Dialogs */}
      <QuickAddJobTypeDialog
        open={showJobTypeDialog}
        onOpenChange={setShowJobTypeDialog}
        onJobTypeAdded={handleJobTypeAdded}
      />
      
      <QuickAddTagDialog
        open={showTagDialog}
        onOpenChange={setShowTagDialog}
        onTagAdded={handleTagAdded}
      />
      
      <ClientsCreateModal
        open={showClientDialog}
        onOpenChange={setShowClientDialog}
        onSuccess={handleClientAdded}
      />
      
      <QuickAddLeadSourceDialog
        open={showLeadSourceDialog}
        onOpenChange={setShowLeadSourceDialog}
        onLeadSourceAdded={handleLeadSourceAdded}
      />
    </>
  );
};
