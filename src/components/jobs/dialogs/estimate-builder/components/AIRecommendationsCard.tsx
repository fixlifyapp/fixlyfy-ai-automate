
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Sparkles } from "lucide-react";
import { sanitizeHtml } from "@/utils/security";

interface AIRecommendationsCardProps {
  jobContext?: {
    job_type: string;
    service_category: string;
    job_value: number;
    client_history?: any;
  };
  recommendations?: Array<{
    warranty_name: string;
    reasoning: string;
    confidence_score: number;
    price: number;
  }>;
}

export const AIRecommendationsCard = ({ 
  jobContext, 
  recommendations = []
}: AIRecommendationsCardProps) => {
  if (!jobContext) return null;

  const sanitizedJobType = sanitizeHtml(jobContext.job_type || '');

  // Quick tips for warranty sales
  const tips = recommendations.length > 0 
    ? recommendations.slice(0, 2).map(rec => `${rec.warranty_name} ($${rec.price}) - ${rec.reasoning}`)
    : [
        `For ${sanitizedJobType} jobs: Always offer 1-year warranty ($89) - most clients expect protection`,
        "Higher value jobs: Suggest 2-year plans ($149) - shows you stand behind your work"
      ];

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-900 text-base">
          <TrendingUp className="h-4 w-4" />
          Warranty Sales Tips
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Tips
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tips.map((tip, index) => (
          <div key={index} className="text-sm text-green-700 bg-white/60 p-2 rounded border border-green-200">
            • {tip}
          </div>
        ))}
        
        <div className="bg-green-100 p-2 rounded text-xs text-green-800">
          💡 <strong>Pro Tip:</strong> Clients with warranties call back 3x more often!
        </div>
      </CardContent>
    </Card>
  );
};
