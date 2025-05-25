
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobTagsCardProps {
  tags: string[];
}

export const JobTagsCard = ({ tags }: JobTagsCardProps) => {
  if (!tags || tags.length === 0) return null;

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-purple-50 border-purple-200 text-purple-600">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
