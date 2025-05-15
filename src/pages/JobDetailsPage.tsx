
import { useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { JobDetailsQuickActions } from "@/components/jobs/JobDetailsQuickActions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { 
  FileText, 
  Package, 
  CreditCard, 
  FileCheck, 
  Paperclip, 
  CheckSquare, 
  Wrench, 
  MessageSquare, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Tag, 
  Edit, 
  Phone, 
  Mail,
  MapPin
} from "lucide-react";

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // State for modals and popovers
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isJobTypeDialogOpen, setIsJobTypeDialogOpen] = useState(false);
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isTasksDialogOpen, setIsTasksDialogOpen] = useState(false);
  const [isAttachmentsDialogOpen, setIsAttachmentsDialogOpen] = useState(false);
  
  // Job data state
  const [jobDescription, setJobDescription] = useState<string>(
    "Customer reported that their HVAC unit is not cooling properly. The unit is making unusual noises when running. The system is about 8 years old, a Carrier model 24ACC6."
  );
  const [jobType, setJobType] = useState<string>("Repair");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2023-05-15T13:30:00"));
  const [startTime, setStartTime] = useState<string>("13:30");
  const [endTime, setEndTime] = useState<string>("15:30");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("Robert Smith");
  const [selectedTags, setSelectedTags] = useState<string[]>(["HVAC", "Residential"]);
  const [notes, setNotes] = useState<string>(
    "Customer mentioned they've had issues with this unit before. Previous service was done by our technician John Doe last summer. Customer prefers morning appointments."
  );
  
  // Mock data
  const technicians = [
    { id: "1", name: "Robert Smith" },
    { id: "2", name: "Janet Wilson" },
    { id: "3", name: "Miguel Rodriguez" },
    { id: "4", name: "Sarah Johnson" },
  ];
  
  const jobTypes = ["Repair", "Service", "Diagnostic", "Maintenance", "Installation"];
  
  const tags = [
    { id: "1", name: "HVAC" },
    { id: "2", name: "Residential" },
    { id: "3", name: "Commercial" },
    { id: "4", name: "Emergency" },
    { id: "5", name: "Warranty" },
  ];

  const clientInfo = {
    name: "Michael Johnson",
    address: "123 Main St, Apt 45",
    phone: "(555) 123-4567",
    email: "michael.johnson@example.com"
  };
  
  return (
    <PageLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <JobDetailsHeader id={id} />
          
          <Card>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto p-0 bg-fixlyfy-bg-interface">
                <TabsTrigger 
                  value="details" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <FileText size={16} className="mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="items" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <Package size={16} className="mr-2" />
                  Items
                </TabsTrigger>
                <TabsTrigger 
                  value="payments" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <CreditCard size={16} className="mr-2" />
                  Payments
                </TabsTrigger>
                <TabsTrigger 
                  value="estimates" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <FileCheck size={16} className="mr-2" />
                  Estimates
                </TabsTrigger>
                <TabsTrigger 
                  value="attachments" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <Paperclip size={16} className="mr-2" />
                  Attachments
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <CheckSquare size={16} className="mr-2" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="equipment" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <Wrench size={16} className="mr-2" />
                  Equipment
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Chat
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-4">Client Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Full Name</p>
                          <p className="font-medium">{clientInfo.name}</p>
                        </div>
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Address</p>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-fixlyfy-text-secondary" />
                            <p>{clientInfo.address}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Contact</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Phone size={14} className="text-fixlyfy-text-secondary" />
                              <p>{clientInfo.phone}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail size={14} className="text-fixlyfy-text-secondary" />
                              <p>{clientInfo.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-4">Job Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Job Description</p>
                          <div
                            onClick={() => setIsDescriptionDialogOpen(true)}
                            className="cursor-pointer flex items-center text-fixlyfy hover:underline"
                          >
                            <p className="line-clamp-2">{jobDescription}</p>
                            <Edit size={14} className="ml-2 text-fixlyfy-text-secondary" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Schedule Date & Time</p>
                          <div
                            onClick={() => setIsScheduleDialogOpen(true)}
                            className="cursor-pointer flex items-center text-fixlyfy hover:underline"
                          >
                            <CalendarIcon size={14} className="mr-2 text-fixlyfy-text-secondary" />
                            <p>{format(selectedDate, "MMM dd, yyyy")}</p>
                            <Clock size={14} className="mx-2 text-fixlyfy-text-secondary" />
                            <p>{startTime} - {endTime}</p>
                            <Edit size={14} className="ml-2 text-fixlyfy-text-secondary" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Job Type</p>
                          <div
                            onClick={() => setIsJobTypeDialogOpen(true)}
                            className="cursor-pointer flex items-center text-fixlyfy hover:underline"
                          >
                            <p>{jobType}</p>
                            <Edit size={14} className="ml-2 text-fixlyfy-text-secondary" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Job Tags</p>
                          <div
                            onClick={() => setIsTagsDialogOpen(true)}
                            className="cursor-pointer flex items-center gap-2 text-fixlyfy hover:underline flex-wrap"
                          >
                            {selectedTags.map((tag) => (
                              <span key={tag} className="bg-fixlyfy/10 text-fixlyfy text-sm px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            <Tag size={14} className="text-fixlyfy-text-secondary" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Team</p>
                          <div
                            onClick={() => setIsTeamDialogOpen(true)}
                            className="cursor-pointer flex items-center text-fixlyfy hover:underline"
                          >
                            <User size={14} className="mr-2 text-fixlyfy-text-secondary" />
                            <p>{selectedTechnician}</p>
                            <Edit size={14} className="ml-2 text-fixlyfy-text-secondary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">Tasks</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsTasksDialogOpen(true)}
                            className="text-fixlyfy hover:text-fixlyfy"
                          >
                            View All
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full border-2 border-fixlyfy flex items-center justify-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-fixlyfy"></div>
                            </div>
                            <p>Initial diagnosis of HVAC unit</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full border-2 border-fixlyfy/30"></div>
                            <p className="text-fixlyfy-text-secondary">Check refrigerant levels</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full border-2 border-fixlyfy/30"></div>
                            <p className="text-fixlyfy-text-secondary">Clean condenser coils</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">Attachments</h3>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setIsAttachmentsDialogOpen(true)}
                            className="text-fixlyfy hover:text-fixlyfy"
                          >
                            View All
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <FileText size={16} />
                              <p>HVAC-specs.pdf</p>
                            </div>
                            <p className="text-xs text-fixlyfy-text-secondary">210 KB</p>
                          </div>
                          <div className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <FileText size={16} />
                              <p>Previous-service.pdf</p>
                            </div>
                            <p className="text-xs text-fixlyfy-text-secondary">185 KB</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-4">Notes</h3>
                        <p className="text-fixlyfy-text-secondary">
                          {notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="items" className="p-6">
                <h3 className="text-lg font-medium mb-4">Items & Parts</h3>
                <p className="text-fixlyfy-text-secondary">Items and parts details will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="payments" className="p-6">
                <h3 className="text-lg font-medium mb-4">Payments</h3>
                <p className="text-fixlyfy-text-secondary">Payment information will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="estimates" className="p-6">
                <h3 className="text-lg font-medium mb-4">Estimates</h3>
                <p className="text-fixlyfy-text-secondary">Estimate details will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="attachments" className="p-6">
                <h3 className="text-lg font-medium mb-4">Attachments</h3>
                <p className="text-fixlyfy-text-secondary">Attached files will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="tasks" className="p-6">
                <h3 className="text-lg font-medium mb-4">Tasks</h3>
                <p className="text-fixlyfy-text-secondary">Job tasks will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="equipment" className="p-6">
                <h3 className="text-lg font-medium mb-4">Equipment</h3>
                <p className="text-fixlyfy-text-secondary">Equipment details will be displayed here.</p>
              </TabsContent>
              
              <TabsContent value="chat" className="p-6">
                <h3 className="text-lg font-medium mb-4">Chat</h3>
                <p className="text-fixlyfy-text-secondary">Job-related conversations will be displayed here.</p>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        <div>
          <JobDetailsQuickActions />
        </div>
      </div>

      {/* Job Description Dialog */}
      <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Job Description</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <textarea 
              className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDescriptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setIsDescriptionDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Job</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Date</p>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="p-3 pointer-events-auto border rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Start Time</p>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="13:30">1:30 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">End Time</p>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:30">3:30 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                    <SelectItem value="17:00">5:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setIsScheduleDialogOpen(false)}>
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Type Dialog */}
      <Dialog open={isJobTypeDialogOpen} onOpenChange={setIsJobTypeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Job Type</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={jobType} onValueChange={setJobType}>
              {jobTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value={type} id={`job-type-${type}`} />
                  <label htmlFor={`job-type-${type}`} className="text-sm font-medium leading-none cursor-pointer">
                    {type}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsJobTypeDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setIsJobTypeDialogOpen(false)}>
              Save Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Tags Dialog */}
      <Dialog open={isTagsDialogOpen} onOpenChange={setIsTagsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Job Tags</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag.name]);
                      } else {
                        setSelectedTags(selectedTags.filter((t) => t !== tag.name));
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`tag-${tag.id}`} className="text-sm font-medium cursor-pointer">
                    {tag.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-medium mb-2">Create New Tag (Admin only)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New tag name"
                  className="px-3 py-1 border rounded-md flex-1"
                  disabled
                />
                <Button variant="outline" disabled>Add</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTagsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setIsTagsDialogOpen(false)}>
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Assignment Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={selectedTechnician} onValueChange={setSelectedTechnician}>
              {technicians.map((tech) => (
                <div key={tech.id} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value={tech.name} id={`tech-${tech.id}`} />
                  <label htmlFor={`tech-${tech.id}`} className="text-sm font-medium leading-none cursor-pointer">
                    {tech.name}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setIsTeamDialogOpen(false)}>
              Assign Technician
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tasks Dialog */}
      <Dialog open={isTasksDialogOpen} onOpenChange={setIsTasksDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Job Tasks</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked className="h-4 w-4" />
                  <span>Initial diagnosis of HVAC unit</span>
                </div>
                <span className="text-xs text-fixlyfy-text-secondary">Completed</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4" />
                  <span>Check refrigerant levels</span>
                </div>
                <span className="text-xs text-fixlyfy-text-secondary">Pending</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4" />
                  <span>Clean condenser coils</span>
                </div>
                <span className="text-xs text-fixlyfy-text-secondary">Pending</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4" />
                  <span>Test system operation</span>
                </div>
                <span className="text-xs text-fixlyfy-text-secondary">Pending</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Add New Task</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter task description"
                  className="px-3 py-1 border rounded-md flex-1"
                />
                <Button variant="outline">Add</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsTasksDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attachments Dialog */}
      <Dialog open={isAttachmentsDialogOpen} onOpenChange={setIsAttachmentsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Job Attachments</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <FileText size={18} />
                  <div>
                    <p>HVAC-specs.pdf</p>
                    <p className="text-xs text-fixlyfy-text-secondary">Added May 14, 2023</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <FileText size={18} />
                  <div>
                    <p>Previous-service.pdf</p>
                    <p className="text-xs text-fixlyfy-text-secondary">Added May 13, 2023</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Upload New Attachment</p>
              <div className="flex gap-2">
                <input
                  type="file"
                  className="py-1 flex-1"
                />
                <Button variant="outline">Upload</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsAttachmentsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default JobDetailsPage;
