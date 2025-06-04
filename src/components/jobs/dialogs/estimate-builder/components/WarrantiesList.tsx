
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, Shield, Lightbulb } from "lucide-react";

interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: any;
  selected: boolean;
}

interface WarrantiesListProps {
  upsellItems: UpsellItem[];
  existingUpsellItems: UpsellItem[];
  isProcessing: boolean;
  onUpsellToggle: (itemId: string) => void;
}

export const WarrantiesList = ({
  upsellItems,
  existingUpsellItems,
  isProcessing,
  onUpsellToggle
}: WarrantiesListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Available Warranties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warranty Sales Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Why warranties matter:</span>
          </div>
          <div className="space-y-1 text-xs text-blue-700">
            <div>• Peace of mind for unexpected issues</div>
            <div>• Shows you stand behind your work</div>
            <div>• Builds long-term client relationships</div>
          </div>
        </div>

        {upsellItems.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No warranty products available</p>
            <p className="text-sm text-muted-foreground mt-1">Add warranty products to your catalog to offer them to customers.</p>
          </div>
        ) : (
          upsellItems.map((item) => {
            const Icon = item.icon;
            const isAlreadyAdded = existingUpsellItems.some(existing => 
              existing.id === item.id && existing.selected
            );
            
            return (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium flex items-center gap-2">
                      {item.title}
                      {isAlreadyAdded && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Already Added
                        </span>
                      )}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <p className="text-lg font-semibold text-green-600 mt-1">
                      +${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={item.selected}
                  onCheckedChange={() => onUpsellToggle(item.id)}
                  disabled={isProcessing}
                />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
