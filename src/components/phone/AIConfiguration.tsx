
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageSquare } from 'lucide-react';

export const AIConfiguration = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">AI Configuration</h3>
          <p className="text-muted-foreground">
            Configure AI settings for individual numbers in the Numbers Management tab.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
