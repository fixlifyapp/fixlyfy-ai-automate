
import React from "react";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Square, Plus, Clock } from "lucide-react";

interface TasksCardProps {
  tasks?: any[];
  jobId?: string;
  editable?: boolean;
}

export const TasksCard = ({ tasks = [], jobId, editable = false }: TasksCardProps) => {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <ModernCard variant="elevated">
      <ModernCardHeader className="flex flex-row items-center justify-between space-y-0">
        <ModernCardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Tasks ({completedTasks}/{totalTasks})
        </ModernCardTitle>
        {editable && (
          <Badge variant="outline" className="gap-1">
            <Plus className="h-3 w-3" />
            Add Task
          </Badge>
        )}
      </ModernCardHeader>
      <ModernCardContent>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks created yet</p>
          ) : (
            tasks.map((task, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex items-center mt-1">
                  {task.completed ? (
                    <CheckSquare className="h-4 w-4 text-green-600" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  )}
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};
