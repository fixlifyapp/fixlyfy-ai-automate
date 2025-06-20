
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Task {
  id: number;
  name: string;
  completed: boolean;
}

interface TaskManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTasks: Task[];
  onSave: (tasks: Task[]) => void;
  disabled?: boolean;
}

export function TaskManagementDialog({
  open,
  onOpenChange,
  initialTasks,
  onSave,
  disabled = false,
}: TaskManagementDialogProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskName, setNewTaskName] = useState("");

  const handleAddTask = () => {
    if (newTaskName.trim() && !disabled) {
      setTasks(prev => [
        ...prev, 
        { id: Math.max(...prev.map(t => t.id), 0) + 1, name: newTaskName.trim(), completed: false }
      ]);
      setNewTaskName("");
      toast.success("Task added");
    }
  };

  const handleRemoveTask = (id: number) => {
    if (!disabled) {
      setTasks(prev => prev.filter(task => task.id !== id));
    }
  };

  const handleToggleTask = (id: number) => {
    if (!disabled) {
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    }
  };

  const handleSave = () => {
    if (!disabled) {
      onSave(tasks);
      onOpenChange(false);
      toast.success("Tasks updated");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Tasks</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Add new task..."
              disabled={disabled}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !disabled) {
                  handleAddTask();
                }
              }}
            />
            <Button 
              onClick={handleAddTask}
              disabled={disabled || !newTaskName.trim()}
            >
              <Plus size={16} />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label className="mb-2 block">
              Current Tasks ({tasks.filter(t => !t.completed).length} remaining)
            </Label>
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`task-${task.id}`} 
                    checked={task.completed}
                    disabled={disabled}
                    onCheckedChange={() => handleToggleTask(task.id)}
                  />
                  <Label 
                    htmlFor={`task-${task.id}`}
                    className={task.completed ? "line-through text-gray-500" : ""}
                  >
                    {task.name}
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => handleRemoveTask(task.id)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <p className="text-sm text-gray-500">No tasks added yet</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={disabled}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
