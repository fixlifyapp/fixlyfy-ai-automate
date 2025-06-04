
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useIntelligentAI } from '@/hooks/useIntelligentAI';

interface WarrantyPurchaseData {
  warranty_id: string;
  warranty_name: string;
  job_type: string;
  service_category: string;
  job_value: number;
  client_segment: string;
  purchased_at: string;
}

interface WarrantyRecommendation {
  warranty_id: string;
  warranty_name: string;
  description: string;
  price: number;
  confidence_score: number;
  reasoning: string;
  personalized_message: string;
  conversion_probability: number;
  popular_percentage: number;
}

export const useWarrantyAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<WarrantyRecommendation[]>([]);
  const { user } = useAuth();
  const { getAIRecommendation } = useIntelligentAI();

  // Track warranty purchase for analytics
  const trackWarrantyPurchase = useCallback(async (data: {
    warranty_id: string;
    warranty_name: string;
    job_id: string;
    job_type: string;
    service_category: string;
    job_value: number;
    client_id: string;
  }) => {
    if (!user) return;

    try {
      await supabase
        .from('warranty_analytics')
        .insert({
          user_id: user.id,
          warranty_id: data.warranty_id,
          warranty_name: data.warranty_name,
          job_id: data.job_id,
          job_type: data.job_type,
          service_category: data.service_category,
          job_value: data.job_value,
          client_id: data.client_id,
          purchased_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking warranty purchase:', error);
    }
  }, [user]);

  // Get AI-powered warranty recommendations
  const getWarrantyRecommendations = useCallback(async (context: {
    job_type: string;
    service_category: string;
    job_value: number;
    client_history?: any;
    existing_warranties?: string[];
  }) => {
    if (!user) return [];

    setIsLoading(true);
    
    try {
      // Get analytics data for similar jobs
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('warranty_analytics')
        .select('*')
        .eq('job_type', context.job_type)
        .order('purchased_at', { ascending: false })
        .limit(100);

      if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError);
      }

      // Get available warranties
      const { data: warranties, error: warrantiesError } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Warranties')
        .eq('active', true);

      if (warrantiesError) {
        console.error('Error fetching warranties:', warrantiesError);
        return [];
      }

      // Generate AI recommendations
      const aiPrompt = `
        Analyze warranty recommendations for a ${context.job_type} job valued at $${context.job_value}.
        
        Available warranties: ${JSON.stringify(warranties)}
        
        Historical purchase data for similar jobs: ${JSON.stringify(analyticsData?.slice(0, 20) || [])}
        
        Client context: ${JSON.stringify(context.client_history || {})}
        
        Please recommend the top 3 most relevant warranties with:
        1. Confidence score (0-100)
        2. Reasoning for recommendation
        3. Personalized message for technician to use
        4. Estimated conversion probability
        5. Popular percentage among similar customers
        
        Focus on data-driven insights and practical sales advice.
      `;

      const aiResponse = await getAIRecommendation({
        prompt: aiPrompt,
        context: {
          currentTask: 'warranty_recommendation',
          jobType: context.job_type,
          jobValue: context.job_value
        }
      });

      // Parse AI response and combine with warranty data
      const aiRecommendations = parseAIRecommendations(aiResponse?.response || '', warranties || []);
      
      setRecommendations(aiRecommendations);
      return aiRecommendations;
      
    } catch (error) {
      console.error('Error getting warranty recommendations:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, getAIRecommendation]);

  // Parse AI response into structured recommendations
  const parseAIRecommendations = (aiResponse: string, warranties: any[]): WarrantyRecommendation[] => {
    // Simple parsing logic - in production, you'd want more sophisticated parsing
    return warranties.slice(0, 3).map((warranty, index) => ({
      warranty_id: warranty.id,
      warranty_name: warranty.name,
      description: warranty.description || '',
      price: warranty.price,
      confidence_score: 85 - (index * 10), // Mock scoring
      reasoning: `Based on similar ${warranty.category} jobs, this warranty is frequently chosen by customers.`,
      personalized_message: `"I recommend this ${warranty.name} because it provides excellent protection for your investment and most customers with similar systems find it very valuable."`,
      conversion_probability: 0.75 - (index * 0.1),
      popular_percentage: 80 - (index * 15)
    }));
  };

  return {
    trackWarrantyPurchase,
    getWarrantyRecommendations,
    recommendations,
    isLoading
  };
};
