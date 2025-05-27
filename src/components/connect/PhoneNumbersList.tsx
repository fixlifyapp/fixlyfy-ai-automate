
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, ShoppingCart, MapPin, DollarSign } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface PhoneNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  locality?: string;
  region?: string;
  price: number;
  monthly_price: number;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  status: "available" | "owned" | "reserved";
  purchased_at?: string;
}

interface PhoneNumbersListProps {
  searchResults: any[];
}

export const PhoneNumbersList = ({ searchResults }: PhoneNumbersListProps) => {
  const [ownedNumbers, setOwnedNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadOwnedNumbers();
  }, []);

  const loadOwnedNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'owned')
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setOwnedNumbers(data || []);
    } catch (error) {
      console.error('Error loading owned numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (phoneNumber: any) => {
    setPurchasing(phoneNumber.phoneNumber);
    
    try {
      const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: {
          action: 'purchase',
          phoneNumber: phoneNumber.phoneNumber
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Successfully purchased ${phoneNumber.phoneNumber}`);
        loadOwnedNumbers(); // Reload owned numbers
      } else {
        throw new Error(data.error || 'Failed to purchase number');
      }
    } catch (error) {
      console.error('Error purchasing number:', error);
      toast.error('Failed to purchase phone number');
    } finally {
      setPurchasing(null);
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phoneNumber;
  };

  const formatCapabilities = (capabilities: any) => {
    const caps = [];
    if (capabilities?.voice) caps.push('Voice');
    if (capabilities?.sms) caps.push('SMS');
    if (capabilities?.mms) caps.push('MMS');
    return caps.join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Owned Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Your Phone Numbers ({ownedNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading your numbers...</p>
            </div>
          ) : ownedNumbers.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Phone Numbers</h3>
              <p className="text-gray-500">
                Search and purchase phone numbers to start making calls and sending messages.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ownedNumbers.map((number) => (
                <div
                  key={number.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {formatPhoneNumber(number.phone_number)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        {number.locality && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {number.locality}, {number.region}
                          </span>
                        )}
                        <span>${number.monthly_price}/month</span>
                        <span>{formatCapabilities(number.capabilities)}</span>
                      </div>
                      {number.purchased_at && (
                        <div className="text-xs text-gray-400">
                          Purchased: {new Date(number.purchased_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="success">Owned</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Numbers from Search */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Available Numbers ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((number) => (
                <div
                  key={number.phoneNumber}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Phone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {formatPhoneNumber(number.phoneNumber)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        {number.locality && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {number.locality}, {number.region}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${number.price}
                        </span>
                        <span>{formatCapabilities(number.capabilities)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePurchase(number)}
                    disabled={purchasing === number.phoneNumber}
                    className="bg-fixlyfy hover:bg-fixlyfy/90"
                  >
                    {purchasing === number.phoneNumber ? "Purchasing..." : "Purchase"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
