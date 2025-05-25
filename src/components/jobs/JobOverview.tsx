
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, User, Phone, Mail, Calendar, Edit, Tag, CheckCircle2, Circle, Plus } from "lucide-react";
import { useJobDetails } from "./context/JobDetailsContext";
import { JobDetailsEditDialog } from "./dialogs/JobDetailsEditDialog";
import { TaskManagementDialog } from "./dialogs/TaskManagementDialog";
import { getTagColor } from "@/data/tags";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

interface JobOverviewProps {
  jobId: string;
}

interface Task {
  id: number;
  name: string;
  completed: boolean;
}

export const JobOverview = ({ jobId }: JobOverviewProps) => {
  const { job, isLoading } = useJobDetails();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const { updateJob } = useJobs();

  if (isLoading || !job) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert tasks from job.tasks (string array) to Task objects for the dialog
  const convertTasksToObjects = (tasks: string[]): Task[] => {
    return tasks.map((task, index) => ({
      id: index + 1,
      name: task,
      completed: false // Default to not completed
    }));
  };

  // Convert Task objects back to string array for storage
  const convertTasksToStrings = (tasks: Task[]): string[] => {
    return tasks.map(task => task.name);
  };

  const handleTasksSave = async (tasks: Task[]) => {
    try {
      const taskStrings = convertTasksToStrings(tasks);
      await updateJob(jobId, { tasks: taskStrings });
      toast.success("Tasks updated successfully");
    } catch (error) {
      console.error("Error updating tasks:", error);
      toast.error("Failed to update tasks");
    }
  };

  const currentTasks = job.tasks ? convertTasksToObjects(job.tasks) : [];
  const completedTasksCount = currentTasks.filter(task => task.completed).length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">Job Information</CardTitle>
              <CardDescription>Basic job details and scheduling</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {job.date ? new Date(job.date).toLocaleDateString() : "No date set"}
                </span>
              </div>
              
              {job.schedule_start && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(job.schedule_start).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {job.schedule_end && 
                      ` - ${new Date(job.schedule_end).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}`
                    }
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {job.technician_id ? "Assigned" : "Unassigned"}
                </span>
              </div>

              {job.lead_source && (
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Lead Source: {job.lead_source}</span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm font-medium mb-2">Description</p>
              <p className="text-sm text-muted-foreground">
                {job.description || "No description provided"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Client Information</CardTitle>
            <CardDescription>Contact details and location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="font-medium">{job.client?.name || "Unknown Client"}</p>
              </div>
              
              {job.client?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{job.client.phone}</span>
                </div>
              )}
              
              {job.client?.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{job.client.email}</span>
                </div>
              )}
              
              {job.client?.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{job.client.address}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Tags</CardTitle>
              <CardDescription>Job categories and labels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={getTagColor(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">Tasks</CardTitle>
              <CardDescription>
                {currentTasks.length > 0 
                  ? `${completedTasksCount}/${currentTasks.length} completed`
                  : "No tasks added"
                }
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsTaskDialogOpen(true)}
            >
              {currentTasks.length > 0 ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            {currentTasks.length > 0 ? (
              <div className="space-y-2">
                {currentTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center space-x-2">
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.name}
                    </span>
                  </div>
                ))}
                {currentTasks.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{currentTasks.length - 5} more tasks
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tasks have been added to this job yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Custom Fields */}
        {job.custom_fields && job.custom_fields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Additional Information</CardTitle>
              <CardDescription>Custom job fields</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {job.custom_fields.map((field) => (
                  <div key={field.id}>
                    <p className="text-sm font-medium">{field.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {field.value || "Not set"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <JobDetailsEditDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        job={job}
      />

      <TaskManagementDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        initialTasks={currentTasks}
        onSave={handleTasksSave}
      />
    </>
  );
};
