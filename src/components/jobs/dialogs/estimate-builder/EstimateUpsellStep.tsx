
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Lightbulb, 
  Zap, 
  TrendingUp, 
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { UpsellItem } from '../shared/types';

interface EstimateUpsellStepProps {
  documentTotal: number;
  onContinue: (upsells: UpsellItem[], notes: string) => void;
  onBack: () => void;
  existingUpsellItems?: UpsellItem[];
  jobContext?: any;
}

export const EstimateUpsellStep = ({
  documentTotal,
  onContinue,
  onBack,
  existingUpsellItems = [],
  jobContext
}: EstimateUpsellStepProps) => {
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>(existingUpsellItems);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const isMobile = useIsMobile();

  // Mock upsell recommendations - in real app this would be AI-generated
  const mockUpsells: UpsellItem[] = [
    {
      id: 'upsell-1',
      name: 'Extended Warranty Package',
      description: 'Protect your investment with our comprehensive 3-year warranty coverage',
      price: 199.99,
      category: 'warranty',
      reasoning: 'Based on your service history, extended warranty provides excellent value and peace of mind.',
      priority: 'high'
    },
    {
      id: 'upsell-2', 
      name: 'Annual Maintenance Plan',
      description: 'Keep your system running efficiently with our annual maintenance program',
      price: 149.99,
      category: 'maintenance',
      reasoning: 'Regular maintenance can prevent 80% of system failures and extend equipment life.',
      priority: 'medium'
    },
    {
      id: 'upsell-3',
      name: 'Emergency Service Priority',
      description: 'Get priority scheduling for emergency repairs and 24/7 support',
      price: 89.99,
      category: 'service',
      reasoning: 'Customers with priority service experience 50% faster response times.',
      priority: 'low'
    }
  ];

  const handleToggleUpsell = (upsell: UpsellItem) => {
    setSelectedUpsells(prev => {
      const exists = prev.find(item => item.id === upsell.id);
      if (exists) {
        return prev.filter(item => item.id !== upsell.id);
      } else {
        return [...prev, upsell];
      }
    });
  };

  const handleContinue = async () => {
    setIsProcessing(true);
    
    // Save selected upsells to database here if needed
    if (selectedUpsells.length > 0) {
      try {
        console.log('Saving selected upsells:', selectedUpsells);
        // Mock save operation
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error saving upsells:', error);
      }
    }
    
    setIsProcessing(false);
    onContinue(selectedUpsells, notes);
  };

  const totalUpsellValue = selectedUpsells.reduce((sum, item) => sum + item.price, 0);
  const newTotal = documentTotal + totalUpsellValue;
  const percentageIncrease = documentTotal > 0 ? ((totalUpsellValue / documentTotal) * 100) : 0;

  return (
    <div className={`space-y-6 ${isMobile ? 'space-y-4' : ''}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              Enhance Your Service
            </h2>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              Add valuable services to maximize customer satisfaction
            </p>
          </div>
        </div>

        {/* Current vs New Total */}
        <div className={`grid grid-cols-3 gap-4 max-w-md mx-auto ${isMobile ? 'text-sm' : ''}`}>
          <div className="text-center">
            <div className={`font-bold text-muted-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
              {formatCurrency(documentTotal)}
            </div>
            <div className="text-muted-foreground">Current</div>
          </div>
          <div className="text-center">
            <div className={`font-bold text-green-600 ${isMobile ? 'text-base' : 'text-lg'}`}>
              +{formatCurrency(totalUpsellValue)}
            </div>
            <div className="text-muted-foreground">Upsells</div>
          </div>
          <div className="text-center">
            <div className={`font-bold text-primary ${isMobile ? 'text-base' : 'text-lg'}`}>
              {formatCurrency(newTotal)}
            </div>
            <div className="text-muted-foreground">New Total</div>
          </div>
        </div>
      </div>

      {/* Upsell Options */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {mockUpsells.map((upsell) => {
          const isSelected = selectedUpsells.some(item => item.id === upsell.id);
          return (
            <Card 
              key={upsell.id}
              className={`relative transition-all cursor-pointer ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'hover:border-primary/50 hover:shadow-sm'
              }`}
              onClick={() => handleToggleUpsell(upsell)}
            >
              {/* Priority Badge */}
              {upsell.priority === 'high' && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-orange-500 text-white gap-1">
                    <Zap className="h-3 w-3" />
                    Recommended
                  </Badge>
                </div>
              )}

              <CardHeader className={isMobile ? 'p-4 pb-2' : 'p-6 pb-4'}>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>
                      {upsell.name}
                    </CardTitle>
                    <div className={`font-bold text-primary mt-1 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      {formatCurrency(upsell.price)}
                    </div>
                  </div>
                  <div className={`ml-2 ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className={isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}>
                <p className={`text-muted-foreground mb-3 ${isMobile ? 'text-sm' : ''}`}>
                  {upsell.description}
                </p>

                {/* AI Reasoning */}
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className={`text-blue-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {upsell.reasoning}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full mt-4 ${isMobile ? 'h-12' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleUpsell(upsell);
                  }}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Added
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Add Service
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Impact Summary */}
      {totalUpsellValue > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-green-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  Excellent Choices!
                </h3>
                <p className={`text-green-700 ${isMobile ? 'text-sm' : ''}`}>
                  You've added {formatCurrency(totalUpsellValue)} in additional value
                  {percentageIncrease > 0 && ` (${percentageIncrease.toFixed(0)}% increase)`}.
                  This enhances customer satisfaction and business growth.
                </p>
              </div>
              <div className="text-right">
                <div className={`font-bold text-green-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  +{formatCurrency(totalUpsellValue)}
                </div>
                <div className={`text-green-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Added Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      <Card>
        <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
          <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? 'p-4 pt-2' : ''}>
          <Textarea
            placeholder="Add any special instructions, terms, or notes for this estimate..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={isMobile ? 'text-base' : ''}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
        <Button 
          variant="outline" 
          onClick={onBack}
          className={`gap-2 ${isMobile ? 'w-full h-12 text-base' : ''}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Items
        </Button>

        <Button 
          onClick={handleContinue}
          disabled={isProcessing}
          className={`gap-2 ${isMobile ? 'w-full h-12 text-base' : ''}`}
        >
          {isProcessing ? "Processing..." : "Continue to Send"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
