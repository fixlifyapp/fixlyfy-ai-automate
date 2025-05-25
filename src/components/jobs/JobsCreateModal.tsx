import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/types/property";
import { useJobs } from "@/hooks/useJobs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useTeam } from "@/hooks/useTeam";
import { Checkbox } from "@/components/ui/checkbox";
import { useUser } from "@/components/auth/hooks";
import { supabase } from "@/integrations/supabase/client";

interface JobsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedClientId?: string;
  onSuccess?: (job: any) => void;
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Job title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  scheduleDate: z.date({
    required_error: "A date is required.",
  }),
  scheduleTime: z.string().min(1, {
    message: "A time is required.",
  }),
  clientId: z.string().min(1, {
    message: "A client is required.",
  }),
  propertyId: z.string().optional(),
  technicianId: z.string().min(1, {
    message: "A technician is required.",
  }),
  sendClientReminder: z.boolean().default(false).optional()
});

export function JobsCreateModal({
  open,
  onOpenChange,
  preselectedClientId,
  onSuccess
}: JobsCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(preselectedClientId || null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [clientData, setClientData] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const { clients, isLoading: isLoadingClients } = useClients();
  const { properties, isLoading: isLoadingProperties } = useProperties(selectedClientId || "");
  const { createJob } = useJobs();
  const { team, isLoading: isLoadingTeam } = useTeam();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      scheduleDate: new Date(),
      scheduleTime: "09:00",
      clientId: preselectedClientId || "",
      propertyId: "",
      technicianId: "",
      sendClientReminder: false
    },
  });

  useEffect(() => {
    if (preselectedClientId) {
      setSelectedClientId(preselectedClientId);
      form.setValue("clientId", preselectedClientId);
    }
  }, [preselectedClientId, form]);

  useEffect(() => {
    if (clients && clients.length > 0 && !selectedClientId) {
      const firstClient = clients[0];
      setSelectedClientId(firstClient.id);
      form.setValue("clientId", firstClient.id);
    }
  }, [clients, form, selectedClientId]);

  useEffect(() => {
    if (selectedClientId && clients) {
      const selectedClient = clients.find((client) => client.id === selectedClientId);
      if (selectedClient) {
        setClientData({
          address: selectedClient.address || "",
          city: selectedClient.city || "",
          state: selectedClient.state || "",
          zip: selectedClient.zip || "",
          country: selectedClient.country || "",
        });
      }
    }
  }, [selectedClientId, clients]);

  useEffect(() => {
    if (properties && properties.length > 0 && !selectedPropertyId) {
      const firstProperty = properties[0];
      setSelectedPropertyId(firstProperty.id);
      form.setValue("propertyId", firstProperty.id);
    }
  }, [properties, form, selectedPropertyId]);

  const handleClientChange = (value: string) => {
    setSelectedClientId(value);
    form.setValue("clientId", value);
    setSelectedPropertyId(null);
    form.setValue("propertyId", "");
  };

  const handlePropertyChange = (value: string) => {
    setSelectedPropertyId(value);
    form.setValue("propertyId", value);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      form.setValue("scheduleDate", date);
    }
  };

  const handleTimeChange = (time: string) => {
    form.setValue("scheduleTime", time);
  };

  const handleCreateJob = async () => {
    try {
      setIsSubmitting(true);
      
      const formData = await form.validate();
      if (!formData) {
        toast.error("Please correct the errors below.");
        return;
      }

      const { title, description, scheduleDate, scheduleTime, clientId, propertyId, technicianId, sendClientReminder } = form.getValues();

      const formattedDate = format(scheduleDate, "yyyy-MM-dd");
      const scheduleStart = `${formattedDate}T${scheduleTime}:00`;

      const newJob = {
        client_id: clientId,
        title: title,
        description: description,
        schedule_start: scheduleStart,
        technician_id: technicianId,
        created_by: user?.id
      };

      const { error } = await createJob(newJob);

      if (error) {
        console.error("Error creating job:", error);
        toast.error("Failed to create job");
        return;
      }

      // Create property if needed
      let propertyIdFinal = selectedPropertyId;
      if (!propertyIdFinal && clientData.address?.trim()) {
        console.log('Creating new property for client:', selectedClientId);
        const { data: newProperty, error: propertyError } = await supabase
          .from('client_properties')
          .insert({
            client_id: selectedClientId!,
            property_name: `${clientData.address} Property`,
            address: clientData.address,
            city: clientData.city || '',
            state: clientData.state || '',
            zip: clientData.zip || '',
            country: clientData.country || 'USA',
            is_primary: true
          })
          .select()
          .single();
          
        if (propertyError) {
          console.error('Error creating property:', propertyError);
          throw propertyError;
        }
        
        propertyIdFinal = newProperty.id;
        console.log('Created property with ID:', propertyIdFinal);
      }

      toast.success("Job created successfully!");
      onOpenChange(false);
      form.reset();
      onSuccess?.(newJob);
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
          <DialogTitle>Create Job</DialogTitle>
          <DialogDescription>
            Create a new job for an existing client.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateJob)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <Label>Job Title</Label>
                  <FormControl>
                    <Input placeholder="HVAC Repair" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <Label>Job Description</Label>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the job in detail"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduleDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label>Schedule Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={handleDateChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduleTime"
                render={({ field }) => (
                  <FormItem>
                    <Label>Schedule Time</Label>
                    <Select onValueChange={handleTimeChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <Label>Client</Label>
                  <Select onValueChange={handleClientChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <Label>Property</Label>
                  <Select onValueChange={handlePropertyChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties?.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.property_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="technicianId"
              render={({ field }) => (
                <FormItem>
                  <Label>Technician</Label>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a technician" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {team?.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sendClientReminder"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="sendClientReminder" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                      Send Client Reminder
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Send a reminder to the client 24 hours before the scheduled time.
                    </p>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
