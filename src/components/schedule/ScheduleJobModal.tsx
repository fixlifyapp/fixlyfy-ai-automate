
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, Wand2, X, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { teamMembers } from "@/data/team";
import { useClients } from "@/hooks/useClients";
import { useJobTypes, useLeadSources, useTags } from "@/hooks/useConfigItems";
import { useJobCustomFields } from "@/hooks/useJobCustomFields";
import { useClientProperties } from "@/hooks/useClientProperties";
import { toast } from "sonner";

interface ScheduleJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: (job: any) => Promise<any>;
  onSuccess?: (job: any) => void;
  preselectedClientId?: string;
}

interface FormData {
  client_id: string;
  property_id: string;
  description: string;
  job_type: string;
  lead_source: string;
  schedule_start: string;
  schedule_end: string;
  technician_id: string;
  duration: string;
  tags: string[];
  tasks: string[];
  customFields: Record<string, string>;
}

export const ScheduleJobModal = ({ 
  open, 
  onOpenChange, 
  onJobCreated, 
  onSuccess, 
  preselectedClientId 
}: ScheduleJobModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    client_id: preselectedClientId || "",
    property_id: "",
    description: "",
    job_type: "",
    lead_source: "",
    schedule_start: "",
    schedule_end: "",
    technician_id: "",
    duration: "60",
    tags: [],
    tasks: [],
    customFields: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  // Configuration hooks with dynamic data from database
  const { clients, isLoading: clientsLoading } = useClients();
  const { items: jobTypes, isLoading: jobTypesLoading } = useJobTypes();
  const { items: leadSources, isLoading: leadSourcesLoading } = useLeadSources();
  const { items: tags, isLoading: tagsLoading } = useTags();
  const { availableFields: customFields, isLoading: customFieldsLoading } = useJobCustomFields();
  
  // Add client properties hook
  const { properties: clientProperties, isLoading: propertiesLoading } = useClientProperties(formData.client_id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    // Clear errors when user starts typing
    setFormErrors([]);
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData({ ...formData, [field]: value });
    setFormErrors([]);
  };

  const handleTagToggle = (tagId: string) => {
    const newTags = formData.tags.includes(tagId)
      ? formData.tags.filter(id => id !== tagId)
      : [...formData.tags, tagId];
    setFormData({ ...formData, tags: newTags });
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setFormData({ 
        ...formData, 
        tasks: [...formData.tasks, newTask.trim()] 
      });
      setNewTask("");
    }
  };

  const handleRemoveTask = (index: number) => {
    setFormData({ 
      ...formData, 
      tasks: formData.tasks.filter((_, i) => i !== index) 
    });
  };

  const handleCustomFieldChange = (fieldId: string, value: string) => {
    setFormData({
      ...formData,
      customFields: { ...formData.customFields, [fieldId]: value }
    });
  };

  const resetForm = () => {
    setFormData({
      client_id: preselectedClientId || "",
      property_id: "",
      description: "",
      job_type: "",
      lead_source: "",
      schedule_start: "",
      schedule_end: "",
      technician_id: "",
      duration: "60",
      tags: [],
      tasks: [],
      customFields: {},
    });
    setShowAISuggestion(false);
    setNewTask("");
    setFormErrors([]);
  };

  const handleSuggestTechnician = () => {
    setShowAISuggestion(true);
    setTimeout(() => {
      setFormData({ ...formData, technician_id: "3" });
    }, 500);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.client_id) {
      errors.push("Please select a client");
    }
    
    if (!formData.job_type) {
      errors.push("Please select a job type");
    }

    // Validate required custom fields
    const requiredFields = customFields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!formData.customFields[field.id]?.trim()) {
        errors.push(`${field.name} is required`);
      }
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submission started with data:", formData);
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get selected client info
      const selectedClient = clients.find(c => c.id === formData.client_id);
      if (!selectedClient) {
        throw new Error("Selected client not found");
      }

      // Calculate schedule_end if not set but schedule_start exists
      let scheduleEnd = formData.schedule_end;
      if (formData.schedule_start && !scheduleEnd) {
        const startDate = new Date(formData.schedule_start);
        const endDate = new Date(startDate.getTime() + parseInt(formData.duration) * 60000);
        scheduleEnd = endDate.toISOString();
      }

      // Auto-generate title based on client and job type
      const autoTitle = `${selectedClient.name} - ${formData.job_type || 'General Service'}`;

      // Prepare comprehensive job data
      const jobData = {
        title: autoTitle,
        client_id: formData.client_id,
        property_id: formData.property_id || undefined,
        description: formData.description,
        job_type: formData.job_type || 'General Service',
        lead_source: formData.lead_source || 'Direct',
        date: formData.schedule_start || new Date().toISOString(),
        schedule_start: formData.schedule_start || undefined,
        schedule_end: scheduleEnd || undefined,
        technician_id: formData.technician_id || undefined,
        status: 'scheduled',
        revenue: 0,
        tags: formData.tags,
        tasks: formData.tasks
      };

      console.log("Submitting job data:", jobData);

      if (onJobCreated) {
        const createdJob = await onJobCreated(jobData);
        
        if (createdJob) {
          console.log("Job created successfully:", createdJob);
          
          // Save custom field values if any
          if (Object.keys(formData.customFields).length > 0) {
            try {
              const { supabase } = await import("@/integrations/supabase/client");
              
              const customFieldPromises = Object.entries(formData.customFields).map(
                ([fieldId, value]) => {
                  if (value.trim()) {
                    return supabase
                      .from('job_custom_field_values')
                      .upsert({
                        job_id: createdJob.id,
                        custom_field_id: fieldId,
                        value: value
                      });
                  }
                  return Promise.resolve();
                }
              );
              
              await Promise.all(customFieldPromises);
              console.log("Custom fields saved successfully");
            } catch (error) {
              console.warn("Failed to save custom fields:", error);
            }
          }

          toast.success(`Job ${createdJob.id} created successfully!`);
          
          if (onSuccess) {
            onSuccess(createdJob);
          }
        }
        
        onOpenChange(false);
        resetForm();
      } else {
        throw new Error("Job creation function not available");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to create job: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCustomField = (field: any) => {
    const value = formData.customFields[field.id] || '';
    
    switch (field.field_type) {
      case 'select':
        return (
          <Select 
            value={value} 
            onValueChange={(value) => handleCustomFieldChange(field.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.name}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === 'true'}
              onCheckedChange={(checked) => 
                handleCustomFieldChange(field.id, checked ? 'true' : 'false')
              }
            />
            <span className="text-sm">{field.name}</span>
          </div>
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder || field.name}
          />
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Create a comprehensive job with all details and schedule it for a technician.
          </DialogDescription>
        </DialogHeader>
        
        {formErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <ul className="text-sm text-red-600 space-y-1">
              {formErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Job Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="client_id">Client *</Label>
                  <Select onValueChange={handleSelectChange("client_id")} value={formData.client_id}>
                    <SelectTrigger id="client_id">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsLoading ? (
                        <SelectItem value="" disabled>Loading clients...</SelectItem>
                      ) : (
                        clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Selection - Show only when client has multiple properties */}
                {formData.client_id && clientProperties.length > 1 && (
                  <div className="col-span-2">
                    <Label htmlFor="property_id">Property Location</Label>
                    <Select onValueChange={handleSelectChange("property_id")} value={formData.property_id}>
                      <SelectTrigger id="property_id">
                        <SelectValue placeholder="Select property location" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertiesLoading ? (
                          <SelectItem value="" disabled>Loading properties...</SelectItem>
                        ) : (
                          clientProperties.map(property => (
                            <SelectItem key={property.id} value={property.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{property.property_name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {property.address}, {property.city}, {property.state}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="col-span-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="Describe the job details..." 
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select onValueChange={handleSelectChange("job_type")} value={formData.job_type}>
                    <SelectTrigger id="job_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypesLoading ? (
                        <SelectItem value="" disabled>Loading types...</SelectItem>
                      ) : (
                        jobTypes.map(type => (
                          <SelectItem key={type.id} value={type.name}>
                            <div className="flex items-center gap-2">
                              {type.color && (
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: type.color }}
                                />
                              )}
                              {type.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <Select onValueChange={handleSelectChange("lead_source")} value={formData.lead_source}>
                    <SelectTrigger id="lead_source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSourcesLoading ? (
                        <SelectItem value="" disabled>Loading sources...</SelectItem>
                      ) : (
                        leadSources
                          .filter(source => source.is_active)
                          .map(source => (
                            <SelectItem key={source.id} value={source.name}>{source.name}</SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Schedule</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule_start">Start Date & Time</Label>
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
                          format(new Date(formData.schedule_start), "PPp")
                        ) : (
                          <span>Pick start date & time</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.schedule_start ? new Date(formData.schedule_start) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const dateTime = new Date(date);
                            dateTime.setHours(9, 0, 0, 0); // Default to 9 AM
                            setFormData({
                              ...formData,
                              schedule_start: dateTime.toISOString()
                            });
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                      {formData.schedule_start && (
                        <div className="p-3 border-t">
                          <Input 
                            type="time" 
                            value={formData.schedule_start ? format(new Date(formData.schedule_start), "HH:mm") : ""}
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
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="schedule_end">End Date & Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.schedule_end && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.schedule_end ? (
                          format(new Date(formData.schedule_end), "PPp")
                        ) : (
                          <span>Pick end date & time</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.schedule_end ? new Date(formData.schedule_end) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const dateTime = new Date(date);
                            dateTime.setHours(17, 0, 0, 0); // Default to 5 PM
                            setFormData({
                              ...formData,
                              schedule_end: dateTime.toISOString()
                            });
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                      {formData.schedule_end && (
                        <div className="p-3 border-t">
                          <Input 
                            type="time" 
                            value={formData.schedule_end ? format(new Date(formData.schedule_end), "HH:mm") : ""}
                            onChange={(e) => {
                              if (formData.schedule_end) {
                                const date = new Date(formData.schedule_end);
                                const [hours, minutes] = e.target.value.split(':');
                                date.setHours(parseInt(hours), parseInt(minutes));
                                setFormData({ ...formData, schedule_end: date.toISOString() });
                              }
                            }}
                          />
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="technician_id">Technician Assignment</Label>
                    <Button 
                      type="button"
                      variant="link" 
                      size="sm" 
                      className="h-6 p-0"
                      onClick={handleSuggestTechnician}
                    >
                      <Wand2 className="h-3.5 w-3.5 mr-1" />
                      AI Suggest
                    </Button>
                  </div>
                  <Select value={formData.technician_id} onValueChange={handleSelectChange("technician_id")}>
                    <SelectTrigger id="technician_id">
                      <SelectValue placeholder="Assign technician (optional)" />
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
              </div>
            </div>

            {/* Tags Section - Dynamic from Database */}
            {!tagsLoading && tags.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={formData.tags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag.id)}
                      style={tag.color && formData.tags.includes(tag.id) ? 
                        { backgroundColor: tag.color, color: 'white' } : 
                        tag.color ? { borderColor: tag.color, color: tag.color } : {}
                      }
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tasks</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
                  />
                  <Button type="button" onClick={handleAddTask} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.tasks.length > 0 && (
                  <div className="space-y-1">
                    {formData.tasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm">{task}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTask(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Fields Section - Dynamic from Database */}
            {!customFieldsLoading && customFields.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {customFields.map(field => (
                    <div key={field.id} className={field.field_type === 'checkbox' ? 'col-span-2' : ''}>
                      <Label htmlFor={field.id}>
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderCustomField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
