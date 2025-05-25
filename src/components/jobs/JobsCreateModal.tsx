import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useClients } from "@/hooks/useClients";
import { useJobs } from "@/hooks/useJobs";
import { CalendarIcon, Check, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useJobTypes, useLeadSources, useTags } from "@/hooks/useConfigItems";

interface JobsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: (job: any) => void;
  preselectedClientId?: string;
  onSuccess?: (job: any) => void;
}

export const JobsCreateModal = ({ open, onOpenChange, onJobCreated, preselectedClientId, onSuccess }: JobsCreateModalProps) => {
  const { clients, isLoading: isClientsLoading } = useClients();
  const { addJob } = useJobs();
  const { jobTypes, isLoading: isJobTypesLoading } = useJobTypes();
  const { leadSources, isLoading: isLeadSourcesLoading } = useLeadSources();
  const { tags: availableTags, isLoading: isTagsLoading } = useTags();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: preselectedClientId || '',
    jobType: '',
    leadSource: '',
    tasks: [] as string[],
    technicianId: '',
    scheduleStart: undefined as Date | undefined,
    scheduleEnd: undefined as Date | undefined,
    date: new Date().toISOString(),
    tags: [] as string[]
  });
  const [newTask, setNewTask] = useState('');

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      clientId: preselectedClientId || '',
      jobType: '',
      leadSource: '',
      tasks: [] as string[],
      technicianId: '',
      scheduleStart: undefined as Date | undefined,
      scheduleEnd: undefined as Date | undefined,
      date: new Date().toISOString(),
      tags: [] as string[]
    });
    setNewTask('');
  };

  // Set preselected client when modal opens
  useEffect(() => {
    if (open && preselectedClientId) {
      setFormData(prev => ({ ...prev, clientId: preselectedClientId }));
    }
  }, [open, preselectedClientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleAddTask = () => {
    if (newTask.trim() !== '') {
      setFormData(prev => ({ ...prev, tasks: [...prev.tasks, newTask.trim()] }));
      setNewTask('');
    }
  };

  const handleRemoveTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.title || formData.title.trim() === '') {
        toast.error('Job title is required');
        return;
      }

      if (!formData.clientId || formData.clientId.trim() === '') {
        toast.error('Client is required');
        return;
      }

      const newJob = await addJob({
        title: formData.title,
        description: formData.description,
        client_id: formData.clientId,
        service: formData.jobType,
        job_type: formData.jobType,
        lead_source: formData.leadSource,
        tasks: formData.tasks,
        technician_id: formData.technicianId || undefined,
        schedule_start: formData.scheduleStart ? new Date(formData.scheduleStart).toISOString() : undefined,
        schedule_end: formData.scheduleEnd ? new Date(formData.scheduleEnd).toISOString() : undefined,
        date: formData.date || new Date().toISOString(),
        revenue: 0,
        tags: formData.tags,
        status: 'scheduled'
      });

      if (newJob) {
        toast.success(`Job ${newJob.id} created successfully`);
        onOpenChange(false);
        resetForm();
        
        if (onJobCreated) {
          onJobCreated(newJob);
        }
        if (onSuccess) {
          onSuccess(newJob);
        }
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Job Title
            </Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client" className="text-right">
              Client
            </Label>
            <Select onValueChange={(value) => handleSelectChange('clientId', value)} defaultValue={formData.clientId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {!isClientsLoading ? (
                  clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="loading">
                    Loading...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jobType" className="text-right">
              Job Type
            </Label>
            <Select onValueChange={(value) => handleSelectChange('jobType', value)} defaultValue={formData.jobType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a job type" />
              </SelectTrigger>
              <SelectContent>
                {!isJobTypesLoading ? (
                  jobTypes?.map((jobType) => (
                    <SelectItem key={jobType.id} value={jobType.name}>
                      {jobType.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="loading">
                    Loading...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="leadSource" className="text-right">
              Lead Source
            </Label>
            <Select onValueChange={(value) => handleSelectChange('leadSource', value)} defaultValue={formData.leadSource}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a lead source" />
              </SelectTrigger>
              <SelectContent>
                {!isLeadSourcesLoading ? (
                  leadSources?.map((leadSource) => (
                    <SelectItem key={leadSource.id} value={leadSource.name}>
                      {leadSource.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="loading">
                    Loading...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="tasks" className="text-right mt-2">
              Tasks
            </Label>
            <div className="col-span-3">
              <div className="flex items-center space-x-2 mb-2">
                <Input
                  type="text"
                  placeholder="Add a task"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTask}>
                  Add
                </Button>
              </div>
              {formData.tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md mb-1">
                  <span>{task}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTask(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="tags" className="text-right mt-2">
              Tags
            </Label>
            <div className="col-span-3">
              <div className="flex flex-wrap gap-2">
                {!isTagsLoading ? (
                  availableTags?.map((tag) => (
                    <Button
                      key={tag.id}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "border-2 rounded-full",
                        formData.tags.includes(tag.name)
                          ? "bg-primary text-primary-foreground hover:bg-primary/80"
                          : "bg-transparent hover:bg-gray-100"
                      )}
                      onClick={() => handleTagToggle(tag.name)}
                    >
                      {tag.name}
                      {formData.tags.includes(tag.name) && (
                        <Check className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  ))
                ) : (
                  <span>Loading tags...</span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scheduleStart" className="text-right">
              Schedule Start
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !formData.scheduleStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduleStart ? (
                    format(formData.scheduleStart, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.scheduleStart}
                  onSelect={(date) => handleDateChange('scheduleStart', date)}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scheduleEnd" className="text-right">
              Schedule End
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !formData.scheduleEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduleEnd ? (
                    format(formData.scheduleEnd, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.scheduleEnd}
                  onSelect={(date) => handleDateChange('scheduleEnd', date)}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
