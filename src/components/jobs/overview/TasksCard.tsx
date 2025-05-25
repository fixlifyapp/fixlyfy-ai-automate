
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TasksCardProps {
  tasks: string[];
}

export const TasksCard = ({ tasks }: TasksCardProps) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Tasks ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{task}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
