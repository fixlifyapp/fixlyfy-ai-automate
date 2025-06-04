
import { useMemo } from "react";
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
  estimateId?: string; // Add this to make tips stable per estimate
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
  recommendations = [],
  estimateId 
}: AIRecommendationsCardProps) => {
  if (!jobContext) return null;

  const sanitizedJobType = sanitizeHtml(jobContext.job_type || '');
  
  // Use useMemo to ensure tips are stable for this specific estimate
  const tips = useMemo(() => {
    // Create a seed based on estimate ID or job context for consistent randomization
    const seed = estimateId || `${jobContext.job_type}-${jobContext.job_value}`;
    
    // Simple hash function to create consistent randomization
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    const seedValue = hashCode(seed);
    
    // Use seeded randomization to get consistent tips for this estimate
    const getSeededRandomTips = () => {
      const shuffled = [...dynamicProTips];
      // Use seed to consistently shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = (seedValue + i) % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const tipCount = 2 + (seedValue % 2); // 2-3 tips consistently
      return shuffled.slice(0, tipCount);
    };

    if (recommendations.length > 0) {
      return [
        ...recommendations.slice(0, 2).map(rec => `${rec.warranty_name} - ${rec.reasoning}`),
        ...getSeededRandomTips().slice(0, 1)
      ];
    } else {
      return getSeededRandomTips();
    }
  }, [recommendations, estimateId, jobContext.job_type, jobContext.job_value]);

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
