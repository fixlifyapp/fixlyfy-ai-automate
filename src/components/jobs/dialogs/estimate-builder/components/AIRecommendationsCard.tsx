
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles } from "lucide-react";

interface AIRecommendationsCardProps {
  jobContext?: {
    job_type: string;
    service_category: string;
    job_value: number;
    client_history?: any;
  };
  onShowRecommendations: () => void;
}

export const AIRecommendationsCard = ({ 
  jobContext, 
  onShowRecommendations 
}: AIRecommendationsCardProps) => {
  if (!jobContext) return null;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Brain className="h-5 w-5" />
          AI-Powered Recommendations
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            New
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-purple-700 mb-4">
          Let AI analyze this job and suggest the most relevant warranties based on similar customer purchases and preferences.
        </p>
        <Button 
          onClick={onShowRecommendations}
          className="bg-gradient-to-r from-purple-600 to-blue-600"
        >
          <Brain className="h-4 w-4 mr-2" />
          Get AI Recommendations
        </Button>
      </CardContent>
    </Card>
  );
};
