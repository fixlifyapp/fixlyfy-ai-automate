
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Circle, MapPin, Phone, Mail, Calendar, Clock, Tag, User, Edit, X, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

  const [notes, setNotes] = useState("Customer mentioned they've had issues with this unit before. Previous service was done by our technician John Doe last summer. Customer prefers morning appointments.");

  // Edit states
  const [editingClientInfo, setEditingClientInfo] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingJobDetails, setEditingJobDetails] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingTasks, setEditingTasks] = useState(false);
  const [newTask, setNewTask] = useState("");

  // Temporary states for editing
  const [tempClientInfo, setTempClientInfo] = useState(clientInfo);
  const [tempJobDetails, setTempJobDetails] = useState(jobDetails);
  const [tempDescription, setTempDescription] = useState(jobDetails.description);
  const [tempNotes, setTempNotes] = useState(notes);

  // Tag management
  const [newTag, setNewTag] = useState("");

  // Handle saving client info
  const handleSaveClientInfo = () => {
    setClientInfo(tempClientInfo);
    setEditingClientInfo(false);
    toast.success("Client information updated");
  };

  // Handle saving job description
  const handleSaveDescription = () => {
    setJobDetails(prev => ({ ...prev, description: tempDescription }));
    setEditingDescription(false);
    toast.success("Job description updated");
  };

  // Handle saving job details
  const handleSaveJobDetails = () => {
    setJobDetails(tempJobDetails);
    setEditingJobDetails(false);
    toast.success("Job details updated");
  };

  // Handle saving notes
  const handleSaveNotes = () => {
    setNotes(tempNotes);
    setEditingNotes(false);
    toast.success("Notes updated");
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (newTag.trim() !== "") {
      setJobDetails(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
      toast.success("Tag added");
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tag: string) => {
    setJobDetails(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
    toast.success("Tag removed");
  };

  // Handle toggling task completion
  const handleToggleTask = (id: number) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Handle adding a task
  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      setTasks(prev => [
        ...prev, 
        { id: Math.max(...prev.map(t => t.id)) + 1, name: newTask.trim(), completed: false }
      ]);
      setNewTask("");
      toast.success("Task added");
    }
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
              {editingClientInfo ? <Save size={16} /> : <Edit size={16} />}
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
              onClick={() => {
                if (editingDescription) {
                  handleSaveDescription();
                } else {
                  setTempDescription(jobDetails.description);
                  setEditingDescription(true);
                }
              }}
            >
              {editingDescription ? <Save size={16} /> : <Edit size={16} />}
            </Button>
          </div>
          
          {editingDescription ? (
            <Input 
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              className="mb-4"
            />
          ) : (
            <p className="text-gray-700">{jobDetails.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-4">
            {jobDetails.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-purple-50 border-purple-200 text-purple-600 flex items-center gap-1"
              >
                {tag}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X size={12} />
                </Button>
              </Badge>
            ))}
            <div className="flex items-center gap-1">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="h-6 w-24 text-xs"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={handleAddTag}
              >
                <Tag size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Job Metadata */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Job Details</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (editingJobDetails) {
                  handleSaveJobDetails();
                } else {
                  setTempJobDetails(jobDetails);
                  setEditingJobDetails(true);
                }
              }}
            >
              {editingJobDetails ? <Save size={16} /> : <Edit size={16} />}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Job Type</p>
              {editingJobDetails ? (
                <Input 
                  value={tempJobDetails.type}
                  onChange={(e) => setTempJobDetails({ ...tempJobDetails, type: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-purple-600">{jobDetails.type}</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Schedule Date & Time</p>
              {editingJobDetails ? (
                <div className="flex gap-2 mt-1">
                  <Input 
                    value={tempJobDetails.scheduleDate}
                    onChange={(e) => setTempJobDetails({ ...tempJobDetails, scheduleDate: e.target.value })}
                  />
                  <Input 
                    value={tempJobDetails.scheduleTime}
                    onChange={(e) => setTempJobDetails({ ...tempJobDetails, scheduleTime: e.target.value })}
                  />
                </div>
              ) : (
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
              )}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Team</p>
              {editingJobDetails ? (
                <Input 
                  value={tempJobDetails.team}
                  onChange={(e) => setTempJobDetails({ ...tempJobDetails, team: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <div className="flex items-center gap-1">
                  <User size={16} className="text-purple-600" />
                  <p className="text-purple-600">{jobDetails.team}</p>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Priority</p>
              {editingJobDetails ? (
                <Input 
                  value={tempJobDetails.priority}
                  onChange={(e) => setTempJobDetails({ ...tempJobDetails, priority: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-purple-600">{jobDetails.priority}</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Source</p>
              {editingJobDetails ? (
                <Input 
                  value={tempJobDetails.source}
                  onChange={(e) => setTempJobDetails({ ...tempJobDetails, source: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="text-purple-600">{jobDetails.source}</p>
              )}
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
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  className="text-purple-600 h-8"
                  onClick={() => setEditingTasks(!editingTasks)}
                >
                  {editingTasks ? "Done" : "Edit"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => handleToggleTask(task.id)}
                  >
                    {task.completed ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <Circle size={18} className="text-gray-300" />
                    )}
                  </Button>
                  <span className={task.completed ? "line-through text-gray-500" : ""}>
                    {task.name}
                  </span>
                </div>
              ))}
              {editingTasks && (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new task..."
                    className="flex-grow"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTask();
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleAddTask}
                  >
                    Add
                  </Button>
                </div>
              )}
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
                <Button variant="ghost" className="text-purple-600 h-8">View All</Button>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <span className="text-lg font-medium">+</span>
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
      
      {/* Notes */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Notes</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (editingNotes) {
                  handleSaveNotes();
                } else {
                  setTempNotes(notes);
                  setEditingNotes(true);
                }
              }}
            >
              {editingNotes ? <Save size={16} /> : <Edit size={16} />}
            </Button>
          </div>
          
          {editingNotes ? (
            <Input 
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              className="mt-1"
            />
          ) : (
            <p className="text-gray-700">{notes}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
