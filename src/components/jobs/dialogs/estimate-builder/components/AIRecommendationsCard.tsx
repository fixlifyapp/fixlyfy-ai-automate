
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

const dynamicProTips = [
  "Offer 1-year warranty for jobs under $500 - clients expect basic protection",
  "2-year warranties convert 60% better on HVAC installations",
  "Extended warranties increase customer retention by 40%",
  "Emergency service warranty sells best during winter months", 
  "Mention warranty within first 5 minutes - increases sales by 35%",
  "Bundle warranties with maintenance plans for higher value",
  "Show warranty comparison chart - visual helps close deals",
  "Follow up warranty calls generate 25% repeat business",
  "Seasonal warranties (winter protection) have 80% acceptance rate",
  "Warranty claims under $200 build massive customer loyalty"
];

export const AIRecommendationsCard = ({ 
  jobContext, 
  recommendations = []
}: AIRecommendationsCardProps) => {
  if (!jobContext) return null;

  const sanitizedJobType = sanitizeHtml(jobContext.job_type || '');
  
  // Get random pro tips (2-3 per invoice)
  const getRandomTips = () => {
    const shuffled = [...dynamicProTips].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 2) + 2); // 2-3 tips
  };

  // Mix AI recommendations with basic tips
  const tips = recommendations.length > 0 
    ? [
        ...recommendations.slice(0, 2).map(rec => `${rec.warranty_name} - ${rec.reasoning}`),
        ...getRandomTips().slice(0, 1)
      ]
    : getRandomTips();

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-900 text-base">
          <TrendingUp className="h-4 w-4" />
          Pro Tips
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            {recommendations.length > 0 ? 'AI + Dynamic' : 'Dynamic'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tips.map((tip, index) => (
          <div key={index} className="text-sm text-green-700 bg-white/60 p-2 rounded border border-green-200">
            • {tip}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
