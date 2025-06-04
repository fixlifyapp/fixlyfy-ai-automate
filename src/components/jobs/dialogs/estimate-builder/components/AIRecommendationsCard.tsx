
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, TrendingUp } from "lucide-react";
import { sanitizeHtml } from "@/utils/security";

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

  // Sanitize job context data to prevent XSS
  const sanitizedJobType = sanitizeHtml(jobContext.job_type || '');
  const sanitizedServiceCategory = sanitizeHtml(jobContext.service_category || '');

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-green-900">
          <TrendingUp className="h-5 w-5" />
          AI Sales Assistant - Boost Your Commission
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
            <Sparkles className="h-3 w-3 mr-1" />
            Sales Tips
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-green-700 mb-4">
          Get AI-powered sales recommendations for this {sanitizedJobType} {sanitizedServiceCategory} job. 
          Learn which warranties are most likely to sell to this client and get proven sales talking points to increase your commission.
        </p>
        <div className="bg-green-100 p-3 rounded-lg mb-4 text-xs text-green-800">
          💡 <strong>Pro Tip:</strong> Clients who purchase warranties are 3x more likely to call you for future services!
        </div>
        <Button 
          onClick={onShowRecommendations}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Brain className="h-4 w-4 mr-2" />
          Get Sales Recommendations
        </Button>
      </CardContent>
    </Card>
  );
};
