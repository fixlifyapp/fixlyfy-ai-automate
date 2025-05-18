
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Circle, MapPin, Phone, Mail, Calendar, Clock, Tag, User, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
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

interface JobDetailsProps {
  jobId: string;
}

export const JobDetails = ({ jobId }: JobDetailsProps) => {
  // In a real app, we would fetch this data from an API
  const [clientInfo, setClientInfo] = useState({
    fullName: "Michael Johnson",
    address: "123 Main St, Apt 45",
    phone: "(555) 123-4567",
    email: "michael.johnson@example.com"
  });

  const [jobDetails, setJobDetails] = useState({
    description: "Customer reported that their HVAC unit is not cooling properly. The unit is making unusual noises and not maintaining set temperature.",
    scheduleDate: "May 15, 2023",
    scheduleTime: "13:30 - 15:30",
    type: "Repair",
    tags: ["HVAC", "Residential"],
    team: "Robert Smith",
    priority: "Medium",
    source: "Phone Call"
  });

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

  // Edit states
  const [editingClientInfo, setEditingClientInfo] = useState(false);
  const [tempClientInfo, setTempClientInfo] = useState(clientInfo);

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

  return (
    <div className="space-y-6">
      {/* Client Info & Contact Panel */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Client Information</h3>
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
                <p className="text-sm text-muted-foreground">Full Name</p>
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
                <Button variant="outline" size="sm" className="mt-2 w-full md:w-auto">
                  View Client Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Job Description */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Job Description</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsDescriptionDialogOpen(true)}
            >
              <Edit size={16} />
            </Button>
          </div>
          
          <p className="text-gray-700">{jobDetails.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {jobDetails.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-purple-50 border-purple-200 text-purple-600 flex items-center gap-1"
              >
                {tag}
              </Badge>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="text-purple-600 border-purple-200"
              onClick={() => setIsTagsDialogOpen(true)}
            >
              <Tag size={14} className="mr-1" />
              Manage Tags
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Job Metadata */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Job Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Job Type</p>
                <p className="text-purple-600">{jobDetails.type}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsTypeDialogOpen(true)}
              >
                <Edit size={16} />
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Schedule Date & Time</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} className="text-purple-600" />
                    <p className="text-purple-600">{jobDetails.scheduleDate}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-purple-600" />
                    <p className="text-purple-600">{jobDetails.scheduleTime}</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsScheduleDialogOpen(true)}
              >
                <Edit size={16} />
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Team</p>
                <div className="flex items-center gap-1">
                  <User size={16} className="text-purple-600" />
                  <p className="text-purple-600">{jobDetails.team}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsTeamDialogOpen(true)}
              >
                <Edit size={16} />
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <p className="text-purple-600">{jobDetails.priority}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsPriorityDialogOpen(true)}
              >
                <Edit size={16} />
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="text-purple-600">{jobDetails.source}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsSourceDialogOpen(true)}
              >
                <Edit size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tasks & Attachments Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <Card className="border-fixlyfy-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">Tasks</h3>
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
            
            <div className="space-y-3">
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
        
        {/* Attachments */}
        <Card className="border-fixlyfy-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">Attachments</h3>
                <p className="text-sm text-muted-foreground">{attachments.length} files</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  className="text-purple-600 h-8"
                  onClick={() => setIsAttachmentsDialogOpen(true)}
                >
                  <Edit size={16} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
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
          </CardContent>
        </Card>
      </div>
      
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
        initialAttachments={attachments}
        onSave={handleUpdateAttachments}
      />
    </div>
  );
};
