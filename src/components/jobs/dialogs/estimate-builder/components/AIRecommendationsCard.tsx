
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Sparkles, Shield, CheckCircle } from "lucide-react";
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
  const sanitizedServiceCategory = sanitizeHtml(jobContext.service_category || '');

  // Default recommendations if no AI data available
  const defaultRecommendations = [
    {
      warranty_name: "1-Year Extended Warranty",
      reasoning: `For ${sanitizedJobType} work, clients often need peace of mind. This warranty covers unexpected issues after installation.`,
      confidence_score: 85,
      price: 89
    },
    {
      warranty_name: "2-Year Protection Plan", 
      reasoning: "Higher value jobs benefit from extended coverage. Show clients you stand behind your work.",
      confidence_score: 78,
      price: 149
    }
  ];

  const displayRecommendations = recommendations.length > 0 ? recommendations : defaultRecommendations;

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-900 text-lg">
          <TrendingUp className="h-5 w-5" />
          Warranty Sales Tips
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Recommended
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayRecommendations.slice(0, 2).map((rec, index) => (
          <div key={index} className="bg-white/60 p-3 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">{rec.warranty_name}</span>
                <span className="text-sm font-bold text-green-700">${rec.price}</span>
              </div>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                {rec.confidence_score}% match
              </Badge>
            </div>
            <p className="text-sm text-green-700 leading-relaxed">{rec.reasoning}</p>
          </div>
        ))}
        
        <div className="bg-green-100 p-3 rounded-lg text-xs text-green-800">
          💡 <strong>Pro Tip:</strong> Clients who purchase warranties are 3x more likely to call you for future services!
        </div>
      </CardContent>
    </Card>
  );
};
