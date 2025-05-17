
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Circle, MapPin, Phone, Mail, Calendar, Clock, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobDetailsProps {
  jobId: string;
}

export const JobDetails = ({ jobId }: JobDetailsProps) => {
  // In a real app, we would fetch this data from an API
  const clientInfo = {
    fullName: "Michael Johnson",
    address: "123 Main St, Apt 45",
    phone: "(555) 123-4567",
    email: "michael.johnson@example.com"
  };

  const jobDetails = {
    description: "Customer reported that their HVAC unit is not cooling properly. The unit is making unusual noises and not maintaining set temperature.",
    scheduleDate: "May 15, 2023",
    scheduleTime: "13:30 - 15:30",
    type: "Repair",
    tags: ["HVAC", "Residential"],
    team: "Robert Smith"
  };

  const tasks = [
    { id: 1, name: "Initial diagnosis of HVAC unit", completed: true },
    { id: 2, name: "Check refrigerant levels", completed: false },
    { id: 3, name: "Clean condenser coils", completed: false }
  ];

  const attachments = [
    { id: 1, name: "HVAC-specs.pdf", size: "210 KB" },
    { id: 2, name: "Previous-service.pdf", size: "185 KB" }
  ];

  const notes = "Customer mentioned they've had issues with this unit before. Previous service was done by our technician John Doe last summer. Customer prefers morning appointments.";

  return (
    <div className="space-y-6">
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Client Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{clientInfo.fullName}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-muted-foreground" />
                <p>{clientInfo.address}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Phone size={16} className="text-muted-foreground" />
                  <p>{clientInfo.phone}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Mail size={16} className="text-muted-foreground" />
                  <p>{clientInfo.email}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Job Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Job Description</p>
              <p className="text-purple-600">{jobDetails.description}</p>
            </div>
            
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
            
            <div>
              <p className="text-sm text-muted-foreground">Job Type</p>
              <div className="flex items-center gap-1">
                <p className="text-purple-600">{jobDetails.type}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Job Tags</p>
              <div className="flex gap-2 mt-1">
                {jobDetails.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-purple-50 border-purple-200 text-purple-600">
                    {tag}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Tag size={14} />
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Team</p>
              <div className="flex items-center gap-1">
                <User size={16} className="text-purple-600" />
                <p className="text-purple-600">{jobDetails.team}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-fixlyfy-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Tasks</h3>
              <Button variant="ghost" className="text-purple-600 h-8">View All</Button>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2">
                  {task.completed ? (
                    <CheckCircle size={18} className="text-purple-600" />
                  ) : (
                    <Circle size={18} className="text-gray-300" />
                  )}
                  <span>{task.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-fixlyfy-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Attachments</h3>
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
      
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Notes</h3>
          </div>
          
          <p className="text-gray-700">{notes}</p>
        </CardContent>
      </Card>
    </div>
  );
};
