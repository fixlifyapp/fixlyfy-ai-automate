
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TasksCardProps {
  tasks: string[];
  jobId: string;
  editable?: boolean;
  onManageTasks?: () => void;
}

export const TasksCard = ({ tasks, jobId, editable = false, onManageTasks }: TasksCardProps) => {
  const taskList = Array.isArray(tasks) ? tasks : [];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Tasks</CardTitle>
        {editable && onManageTasks && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onManageTasks}
            className="h-8 w-8 p-0"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {taskList.length > 0 ? (
          <div className="space-y-2">
            {taskList.map((task, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{task}</span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t">
              <Badge variant="outline">
                {taskList.length} task{taskList.length !== 1 ? 's' : ''} total
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No tasks assigned</div>
        )}
      </CardContent>
    </Card>
  );
};
