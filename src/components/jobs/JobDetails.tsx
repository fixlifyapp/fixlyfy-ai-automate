import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Circle, MapPin, Phone, Mail, Calendar, Clock, Tag, User, Edit, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { JobDetailsEditDialog } from "./dialogs/JobDetailsEditDialog";
import { JobTypeDialog } from "./dialogs/JobTypeDialog";
import { TeamSelectionDialog } from "./dialogs/TeamSelectionDialog";
import { SourceSelectionDialog } from "./dialogs/SourceSelectionDialog";
import { PrioritySelectionDialog } from "./dialogs/PrioritySelectionDialog";
import { ScheduleSelectionDialog } from "./dialogs/ScheduleSelectionDialog";
import { TagsManagementDialog } from "./dialogs/TagsManagementDialog";
import { TaskManagementDialog } from "./dialogs/TaskManagementDialog";
import { AttachmentUploadDialog } from "./dialogs/AttachmentUploadDialog";
import { ApplianceTypeDialog } from "./dialogs/ApplianceTypeDialog";
import { DryerIcon, DishwasherIcon, FridgeIcon, WasherIcon } from "@/components/icons/ApplianceIcons";
import { useJobDetails } from "./context/JobDetailsContext";
import { useNavigate } from "react-router-dom";

interface JobDetailsProps {
  jobId: string;
}

// Appliance type definition
type ApplianceType = {
  id: number;
  type: "dryer" | "dishwasher" | "fridge" | "washer";
  model?: string;
};

// Get appliance icon based on type
const getApplianceIcon = (type: ApplianceType['type']) => {
  switch (type) {
    case "dryer": return <DryerIcon size={18} />;
    case "dishwasher": return <DishwasherIcon size={18} />;
    case "fridge": return <FridgeIcon size={18} />;
    case "washer": return <WasherIcon size={18} />;
    default: return <DryerIcon size={18} />;
  }
};

export const JobDetails = ({ jobId }: JobDetailsProps) => {
  const navigate = useNavigate();
  const { job, isLoading } = useJobDetails();

  // Initialize client info from job data
  const [clientInfo, setClientInfo] = useState({
    fullName: job?.client || "Loading...",
    address: job?.address || "Loading...",
    phone: job?.phone || "",
    email: job?.email || ""
  });

  // Update client info when job data loads
  React.useEffect(() => {
    if (job) {
      setClientInfo({
        fullName: job.client,
        address: job.address,
        phone: job.phone,
        email: job.email
      });
    }
  }, [job]);

  const [jobDetails, setJobDetails] = useState({
    description: job?.description || "Loading job description...",
    scheduleDate: "May 15, 2023", // TODO: Use actual schedule data
    scheduleTime: "13:30 - 15:30", // TODO: Use actual schedule data
    type: job?.service || "Loading...",
    tags: ["HVAC", "Residential"], // TODO: Use actual tags from job
    team: "Robert Smith", // TODO: Use actual technician data
    priority: "Medium", // TODO: Use actual priority
    source: "Phone Call" // TODO: Use actual source
  });

  // Update job details when job data loads
  React.useEffect(() => {
    if (job) {
      setJobDetails(prev => ({
        ...prev,
        description: job.description || "No description provided",
        type: job.service || "General Service"
      }));
    }
  }, [job]);

  // Appliances state
  const [appliances, setAppliances] = useState<ApplianceType[]>([
    { id: 1, type: "fridge", model: "Samsung RF28R7551SR" },
    { id: 2, type: "washer", model: "LG WM3900HWA" }
  ]);

  // Additional job types state
  const [additionalJobTypes, setAdditionalJobTypes] = useState<string[]>([]);
  
  // Additional sources state
  const [additionalSources, setAdditionalSources] = useState<string[]>([]);

  const [tasks, setTasks] = useState([
    { id: 1, name: "Initial diagnosis of HVAC unit", completed: true },
    { id: 2, name: "Check refrigerant levels", completed: false },
    { id: 3, name: "Clean condenser coils", completed: false }
  ]);

  const [attachments, setAttachments] = useState([
    { id: 1, name: "HVAC-specs.pdf", size: "210 KB" },
    { id: 2, name: "Previous-service.pdf", size: "185 KB" }
  ]);

  // Dialog open states
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);
  const [isPriorityDialogOpen, setIsPriorityDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [isTasksDialogOpen, setIsTasksDialogOpen] = useState(false);
  const [isAttachmentsDialogOpen, setIsAttachmentsDialogOpen] = useState(false);
  const [isApplianceDialogOpen, setIsApplianceDialogOpen] = useState(false);

  // Edit states
  const [editingClientInfo, setEditingClientInfo] = useState(false);
  const [tempClientInfo, setTempClientInfo] = useState(clientInfo);

  // Tag colors based on tag name
  const getTagColor = (tag: string) => {
    const tagColors: Record<string, string> = {
      "HVAC": "bg-purple-50 border-purple-200 text-purple-600",
      "Residential": "bg-blue-50 border-blue-200 text-blue-600",
      "Commercial": "bg-indigo-50 border-indigo-200 text-indigo-600",
      "Emergency": "bg-red-50 border-red-200 text-red-600",
      "Maintenance": "bg-green-50 border-green-200 text-green-600",
      "Installation": "bg-amber-50 border-amber-200 text-amber-600",
      "Repair": "bg-orange-50 border-orange-200 text-orange-600"
    };
    
    return tagColors[tag] || "bg-purple-50 border-purple-200 text-purple-600";
  };
  
  // Priority colors based on priority level
  const getPriorityColor = (priority: string) => {
    const priorityColors: Record<string, string> = {
      "High": "text-red-600",
      "Medium": "text-orange-600",
      "Low": "text-green-600"
    };
    
    return priorityColors[priority] || "text-purple-600";
  };

  // Handle saving client info
  const handleSaveClientInfo = () => {
    setClientInfo(tempClientInfo);
    setEditingClientInfo(false);
    toast.success("Client information updated");
  };

  // Handle updating job description
  const handleUpdateDescription = (description: string) => {
    setJobDetails(prev => ({ ...prev, description }));
  };

  // Handle updating job type
  const handleUpdateType = (type: string) => {
    setJobDetails(prev => ({ ...prev, type }));
  };

  // Handle updating team
  const handleUpdateTeam = (team: string) => {
    setJobDetails(prev => ({ ...prev, team }));
  };

  // Handle updating source
  const handleUpdateSource = (source: string) => {
    setJobDetails(prev => ({ ...prev, source }));
  };

  // Handle updating priority
  const handleUpdatePriority = (priority: string) => {
    setJobDetails(prev => ({ ...prev, priority }));
  };

  // Handle updating schedule
  const handleUpdateSchedule = (date: string, timeWindow: string) => {
    setJobDetails(prev => ({ 
      ...prev, 
      scheduleDate: date,
      scheduleTime: timeWindow
    }));
  };

  // Handle updating tags
  const handleUpdateTags = (tags: string[]) => {
    setJobDetails(prev => ({ ...prev, tags }));
  };

  // Handle updating tasks
  const handleUpdateTasks = (updatedTasks: typeof tasks) => {
    setTasks(updatedTasks);
  };

  // Handle updating attachments
  const handleUpdateAttachments = (updatedAttachments: typeof attachments) => {
    setAttachments(updatedAttachments);
  };

  // Get team color
  const getTeamColor = (team: string) => {
    const teamColors: Record<string, string> = {
      "Robert Smith": "text-purple-600",
      "Jane Cooper": "text-blue-600",
      "Michael Johnson": "text-green-600",
      "Sarah Williams": "text-pink-600",
      "David Martinez": "text-amber-600"
    };
    
    return teamColors[team] || "text-purple-600";
  };

  // Handle appliances update
  const handleUpdateAppliances = (updatedAppliances: ApplianceType[]) => {
    setAppliances(updatedAppliances);
  };

  // Handle adding new job type
  const handleAddJobType = (type: string) => {
    if (type && !additionalJobTypes.includes(type)) {
      setAdditionalJobTypes([...additionalJobTypes, type]);
    }
  };

  // Handle removing job type
  const handleRemoveJobType = (index: number) => {
    const newTypes = [...additionalJobTypes];
    newTypes.splice(index, 1);
    setAdditionalJobTypes(newTypes);
  };

  // Handle adding new source
  const handleAddSource = (source: string) => {
    if (source && !additionalSources.includes(source)) {
      setAdditionalSources([...additionalSources, source]);
    }
  };

  // Handle removing source
  const handleRemoveSource = (index: number) => {
    const newSources = [...additionalSources];
    newSources.splice(index, 1);
    setAdditionalSources(newSources);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="h-5 bg-gray-200 rounded w-72"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <div className="text-red-500">Error loading job details</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Information Section - Updated structure like JobsCreateModal */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Client Information</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (editingClientInfo) {
                  handleSaveClientInfo();
                } else {
                  setTempClientInfo(clientInfo);
                  setEditingClientInfo(true);
                }
              }}
            >
              {editingClientInfo ? <CheckCircle size={16} /> : <Edit size={16} />}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Info */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                {editingClientInfo ? (
                  <Input 
                    value={tempClientInfo.fullName}
                    onChange={(e) => setTempClientInfo({ ...tempClientInfo, fullName: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{clientInfo.fullName}</p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                {editingClientInfo ? (
                  <Input 
                    value={tempClientInfo.address}
                    onChange={(e) => setTempClientInfo({ ...tempClientInfo, address: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} className="text-muted-foreground" />
                    <p>{clientInfo.address}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contact Methods */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                {editingClientInfo ? (
                  <div className="space-y-2 mt-1">
                    <Input 
                      value={tempClientInfo.phone}
                      onChange={(e) => setTempClientInfo({ ...tempClientInfo, phone: e.target.value })}
                      placeholder="Phone"
                    />
                    <Input 
                      value={tempClientInfo.email}
                      onChange={(e) => setTempClientInfo({ ...tempClientInfo, email: e.target.value })}
                      placeholder="Email"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Phone size={16} className="text-fixlyfy" />
                      <p>{clientInfo.phone}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail size={16} className="text-fixlyfy" />
                      <p>{clientInfo.email}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {!editingClientInfo && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full md:w-auto"
                  onClick={() => {
                    if (job.clientId) {
                      navigate(`/clients/${job.clientId}`);
                    }
                  }}
                >
                  View Client Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Job Details Section - Similar to JobsCreateModal structure */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Job Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Type */}
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm text-muted-foreground">Job Type</p>
              <div className="cursor-pointer" onClick={() => setIsTypeDialogOpen(true)}>
                <Badge className="text-purple-600 bg-purple-50">{jobDetails.type}</Badge>
              </div>
            </div>
            
            {/* Job Description */}
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <div className="cursor-pointer" onClick={() => setIsDescriptionDialogOpen(true)}>
                <p className="text-gray-700">{jobDetails.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Schedule Section - Similar to JobsCreateModal structure */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Schedule</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsScheduleDialogOpen(true)}
            >
              <Edit size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date & Time */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Start Date</p>
              <div className="flex items-center gap-1">
                <Calendar size={16} className="text-purple-600" />
                <p className="text-purple-600">{jobDetails.scheduleDate}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Start Time</p>
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-purple-600" />
                <p className="text-purple-600">{jobDetails.scheduleTime}</p>
              </div>
            </div>
            
            {/* Technician */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Technician</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsTeamDialogOpen(true)}
                >
                  <Edit size={16} />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <User size={16} className={getTeamColor(jobDetails.team)} />
                <p className={getTeamColor(jobDetails.team)}>{jobDetails.team}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tasks Section - Similar to JobsCreateModal structure */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Tasks</h3>
              <p className="text-sm text-muted-foreground">
                {tasks.filter(t => !t.completed).length} tasks remaining
              </p>
            </div>
            <Button 
              variant="ghost" 
              className="text-purple-600 h-8"
              onClick={() => setIsTasksDialogOpen(true)}
            >
              <Edit size={16} />
            </Button>
          </div>
          
          <div className="space-y-3 cursor-pointer" onClick={() => setIsTasksDialogOpen(true)}>
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                {task.completed ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : (
                  <Circle size={18} className="text-gray-300" />
                )}
                <span className={task.completed ? "line-through text-gray-500" : ""}>
                  {task.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Tags & Attachments Section - Similar to JobsCreateModal structure */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Tags & Attachments</h3>
          </div>
          
          <div className="space-y-4">
            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Tags</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsTagsDialogOpen(true)}
                >
                  <Edit size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobDetails.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getTagColor(tag)}`}
                    onClick={() => setIsTagsDialogOpen(true)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Attachments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Attachments ({attachments.length} files)</p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsAttachmentsDialogOpen(true)}
                >
                  <Edit size={16} />
                </Button>
              </div>
              <div className="space-y-3 cursor-pointer" onClick={() => setIsAttachmentsDialogOpen(true)}>
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gray-500" />
                      <span>{attachment.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{attachment.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      <JobDetailsEditDialog
        open={isDescriptionDialogOpen}
        onOpenChange={setIsDescriptionDialogOpen}
        initialDescription={jobDetails.description}
        onSave={handleUpdateDescription}
      />
      
      <JobTypeDialog
        open={isTypeDialogOpen}
        onOpenChange={setIsTypeDialogOpen}
        initialType={jobDetails.type}
        onSave={handleUpdateType}
      />
      
      <TeamSelectionDialog
        open={isTeamDialogOpen}
        onOpenChange={setIsTeamDialogOpen}
        initialTeam={jobDetails.team}
        onSave={handleUpdateTeam}
      />
      
      <SourceSelectionDialog
        open={isSourceDialogOpen}
        onOpenChange={setIsSourceDialogOpen}
        initialSource={jobDetails.source}
        onSave={handleUpdateSource}
      />
      
      <PrioritySelectionDialog
        open={isPriorityDialogOpen}
        onOpenChange={setIsPriorityDialogOpen}
        initialPriority={jobDetails.priority}
        onSave={handleUpdatePriority}
      />
      
      <ScheduleSelectionDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        initialDate={jobDetails.scheduleDate}
        initialTimeWindow={jobDetails.scheduleTime}
        onSave={handleUpdateSchedule}
      />
      
      <TagsManagementDialog
        open={isTagsDialogOpen}
        onOpenChange={setIsTagsDialogOpen}
        initialTags={jobDetails.tags}
        onSave={handleUpdateTags}
      />
      
      <TaskManagementDialog
        open={isTasksDialogOpen}
        onOpenChange={setIsTasksDialogOpen}
        initialTasks={tasks}
        onSave={handleUpdateTasks}
      />
      
      <AttachmentUploadDialog
        open={isAttachmentsDialogOpen}
        onOpenChange={setIsAttachmentsDialogOpen}
        jobId={jobId}
        onUploadSuccess={() => {
          setIsAttachmentsDialogOpen(false);
          // Refresh attachments if needed
        }}
      />
      
      <ApplianceTypeDialog
        open={isApplianceDialogOpen}
        onOpenChange={setIsApplianceDialogOpen}
        initialAppliances={appliances}
        onSave={handleUpdateAppliances}
      />
    </div>
  );
};
