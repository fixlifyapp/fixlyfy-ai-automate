
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';

export const CallConfiguration = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Call Configuration</h3>
          <p className="text-muted-foreground">
            Configure call settings for individual numbers in the Numbers Management tab.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
