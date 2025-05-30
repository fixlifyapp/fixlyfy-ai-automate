
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";

export const ClientValuePanel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-fixlify to-fixlify-light rounded-lg">
            <Star className="h-4 w-4 text-white" />
          </div>
          Client Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Premium Clients</p>
              <p className="text-sm text-fixlify-text-secondary">High-value customers</p>
            </div>
            <Badge className="bg-fixlify/10 text-fixlify border-fixlify/30">23</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Repeat Customers</p>
              <p className="text-sm text-fixlify-text-secondary">Returning clients</p>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-fixlify-success" />
              <span className="text-sm font-medium">67%</span>
            </div>
          </div>
          
          <div className="pt-3 border-t border-fixlify-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-fixlify-text-secondary">Avg Lifetime Value</span>
              <span className="font-semibold text-fixlify">$1,247</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
