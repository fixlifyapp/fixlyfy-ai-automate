
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, CheckSquare, Plus, Trash2 } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";

interface TasksCardProps {
  tasks: string[];
  jobId?: string;
  editable?: boolean;
}

export const TasksCard = ({ tasks, jobId, editable = false }: TasksCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTasks, setEditTasks] = useState<string[]>(tasks || []);
  const [newTask, setNewTask] = useState("");
  const { updateJob } = useJobs();

  if (!tasks || tasks.length === 0) {
    if (!editable) return null;
    
    return (
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={CheckSquare}>
              Tasks
            </ModernCardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-fixlyfy hover:text-fixlyfy-dark"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          <p className="text-muted-foreground">No tasks assigned yet</p>
        </ModernCardContent>
      </ModernCard>
    );
  }

  const handleSave = async () => {
    if (!jobId) return;
    
    const result = await updateJob(jobId, {
      tasks: editTasks.filter(task => task.trim())
    });
    if (result) {
      setIsEditing(false);
      toast.success("Tasks updated successfully");
    }
  };

  const handleCancel = () => {
    setEditTasks(tasks || []);
    setNewTask("");
    setIsEditing(false);
  };

  const addTask = () => {
    if (newTask.trim()) {
      setEditTasks([...editTasks, newTask.trim()]);
      setNewTask("");
    }
  };

  const removeTask = (index: number) => {
    setEditTasks(editTasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, value: string) => {
    const updated = [...editTasks];
    updated[index] = value;
    setEditTasks(updated);
  };

  return (
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle icon={CheckSquare}>
            Tasks
          </ModernCardTitle>
          {editable && !isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-fixlyfy hover:text-fixlyfy-dark"
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : editable && isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-green-600 hover:text-green-700"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </ModernCardHeader>
      <ModernCardContent>
        {isEditing ? (
          <div className="space-y-3">
            {editTasks.map((task, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={task}
                  onChange={(e) => updateTask(index, e.target.value)}
                  placeholder="Task description..."
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTask(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 items-center">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add new task..."
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={addTask}
                className="text-green-600 hover:text-green-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-500" />
                <span className="text-sm">{task}</span>
              </div>
            ))}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
