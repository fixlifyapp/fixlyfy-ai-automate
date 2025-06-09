
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UpsellStepProps, UpsellItem } from '../shared/types';

export const InvoiceUpsellStep = ({
  documentTotal,
  onContinue,
  onBack,
  existingUpsellItems = [],
  jobContext
}: UpsellStepProps) => {
  const [selectedItems, setSelectedItems] = useState<UpsellItem[]>(existingUpsellItems);
  const [notes, setNotes] = useState('');
  const [availableUpsells, setAvailableUpsells] = useState<UpsellItem[]>([]);

  useEffect(() => {
    // Mock upsell items for now
    const mockUpsells: UpsellItem[] = [
      {
        id: '1',
        name: 'Extended Warranty',
        description: '2-year extended warranty coverage',
        price: 150,
        category: 'warranty'
      },
      {
        id: '2',
        name: 'Priority Support',
        description: '24/7 priority support for 1 year',
        price: 200,
        category: 'service'
      },
      {
        id: '3',
        name: 'Maintenance Plan',
        description: 'Annual maintenance package',
        price: 300,
        category: 'maintenance'
      }
    ];

    setAvailableUpsells(mockUpsells);
  }, [jobContext]);

  const toggleUpsellSelection = (upsell: UpsellItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.find(item => item.id === upsell.id);
      if (isSelected) {
        return prev.filter(item => item.id !== upsell.id);
      } else {
        return [...prev, { ...upsell, isSelected: true }];
      }
    });
  };

  const handleContinue = () => {
    onContinue(selectedItems, notes);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recommended Add-ons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableUpsells.map((upsell) => {
              const isSelected = selectedItems.find(item => item.id === upsell.id);
              return (
                <div
                  key={upsell.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleUpsellSelection(upsell)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{upsell.name}</h4>
                        <Badge variant="secondary">{upsell.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{upsell.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">${upsell.price}</span>
                      {isSelected && (
                        <div className="text-green-600 text-sm mt-1">✓ Selected</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>${item.price}</span>
                </div>
              ))}
              <div className="border-t pt-2 font-bold">
                <div className="flex justify-between">
                  <span>Total Add-ons:</span>
                  <span>${selectedItems.reduce((sum, item) => sum + item.price, 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about the selected add-ons..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
};
