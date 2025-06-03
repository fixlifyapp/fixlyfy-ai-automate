
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Shield, Clock, Wrench } from "lucide-react";

interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: any;
  selected: boolean;
}

interface EstimateUpsellStepProps {
  onContinue: (upsellItems: UpsellItem[], notes: string) => void;
  onBack: () => void;
  estimateTotal: number;
}

export const EstimateUpsellStep = ({ onContinue, onBack, estimateTotal }: EstimateUpsellStepProps) => {
  const [notes, setNotes] = useState("");
  const [upsellItems, setUpsellItems] = useState<UpsellItem[]>([
    {
      id: "warranty",
      title: "Extended Warranty",
      description: "1-year extended warranty on all parts and labor",
      price: 150,
      icon: Shield,
      selected: false
    },
    {
      id: "maintenance",
      title: "Annual Maintenance Plan",
      description: "Yearly preventive maintenance visits",
      price: 200,
      icon: Wrench,
      selected: false
    },
    {
      id: "priority",
      title: "Priority Service",
      description: "24/7 priority emergency service calls",
      price: 100,
      icon: Clock,
      selected: false
    }
  ]);

  const handleUpsellToggle = (itemId: string) => {
    setUpsellItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectedUpsells = upsellItems.filter(item => item.selected);
  const upsellTotal = selectedUpsells.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = estimateTotal + upsellTotal;

  const handleContinue = () => {
    onContinue(selectedUpsells, notes);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Enhance Your Service</h3>
        <p className="text-muted-foreground">Add valuable services to provide complete protection</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommended Add-ons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upsellItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="text-lg font-semibold text-green-600 mt-1">
                      +${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={item.selected}
                  onCheckedChange={() => handleUpsellToggle(item.id)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="upsell-notes">Special Instructions or Comments</Label>
            <Textarea
              id="upsell-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special notes or instructions for the client..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Base Estimate:</span>
              <span>${estimateTotal.toFixed(2)}</span>
            </div>
            {selectedUpsells.length > 0 && (
              <>
                {selectedUpsells.map(item => (
                  <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                    <span>{item.title}:</span>
                    <span>+${item.price.toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Add-ons Subtotal:</span>
                  <span>${upsellTotal.toFixed(2)}</span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Estimate:</span>
              <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back to Items
        </Button>
        <Button onClick={handleContinue} className="gap-2">
          Continue to Send
        </Button>
      </div>
    </div>
  );
};
