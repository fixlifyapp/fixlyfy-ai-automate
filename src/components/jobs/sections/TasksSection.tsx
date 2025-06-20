
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Edit } from "lucide-react";

interface Task {
  id: number;
  name: string;
  completed: boolean;
}

interface TasksSectionProps {
  tasks: Task[];
  onTasksEdit: () => void;
}

export const TasksSection = ({ tasks, onTasksEdit }: TasksSectionProps) => {
  return (
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
            onClick={onTasksEdit}
          >
            <Edit size={16} />
          </Button>
        </div>
        
        <div className="space-y-3 cursor-pointer" onClick={onTasksEdit}>
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
  );
};
