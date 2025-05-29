
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, DollarSign, Search, Bot, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AvailablePhoneNumber {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  price: string;
  priceUnit: string;
}

export const PhoneNumberPurchase = () => {
  const [searchArea, setSearchArea] = useState("");
  const [searchType, setSearchType] = useState<"local" | "toll-free">("local");
  const [availableNumbers, setAvailableNumbers] = useState<AvailablePhoneNumber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const searchPhoneNumbers = async () => {
    if (!searchArea.trim()) {
      toast({
        title: "Search Area Required",
        description: "Please enter a city, state, or area code to search for phone numbers.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-phone-numbers', {
        body: {
          areaCode: searchArea,
          type: searchType
        }
      });

      if (error) throw error;

      setAvailableNumbers(data.phoneNumbers || []);
      
      if (data.phoneNumbers?.length === 0) {
        toast({
          title: "No Numbers Found",
          description: "No phone numbers are available in this area. Try a different location.",
        });
      }
    } catch (error) {
      console.error('Error searching phone numbers:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search for phone numbers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const purchasePhoneNumber = async (phoneNumber: AvailablePhoneNumber) => {
    setPurchasing(phoneNumber.phoneNumber);
    try {
      const { error } = await supabase.functions.invoke('purchase-phone-number', {
        body: {
          phoneNumber: phoneNumber.phoneNumber,
          friendlyName: phoneNumber.friendlyName,
          locality: phoneNumber.locality,
          region: phoneNumber.region,
          capabilities: phoneNumber.capabilities,
          price: parseFloat(phoneNumber.price)
        }
      });

      if (error) throw error;

      toast({
        title: "Phone Number Purchased!",
        description: `Successfully purchased ${phoneNumber.phoneNumber}. You can now enable AI dispatcher for this number.`,
      });

      // Remove purchased number from available list
      setAvailableNumbers(prev => prev.filter(n => n.phoneNumber !== phoneNumber.phoneNumber));

    } catch (error) {
      console.error('Error purchasing phone number:', error);
      toast({
        title: "Purchase Failed",
        description: "Unable to purchase this phone number. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <Card className="border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-gray-900">Purchase Phone Numbers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Search Form */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter city, state, or area code (e.g., 'New York' or '212')"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchPhoneNumbers()}
              />
            </div>
            <Select value={searchType} onValueChange={(value: "local" | "toll-free") => setSearchType(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="toll-free">Toll-Free</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={searchPhoneNumbers} disabled={isSearching}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Available Numbers */}
        {!isSearching && availableNumbers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Available Numbers ({availableNumbers.length})
            </h3>
            {availableNumbers.map((number) => (
              <div key={number.phoneNumber} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900 text-lg">
                        {number.phoneNumber}
                      </span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Bot className="h-3 w-3 mr-1" />
                        AI Ready
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{number.locality}, {number.region}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${number.price}/{number.priceUnit}</span>
                      </div>
                      {number.capabilities.voice && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-2 w-2 mr-1" />
                          Voice
                        </Badge>
                      )}
                      {number.capabilities.sms && (
                        <Badge variant="outline" className="text-xs">SMS</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => purchasePhoneNumber(number)}
                  disabled={purchasing === number.phoneNumber}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {purchasing === number.phoneNumber ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Purchasing...
                    </>
                  ) : (
                    'Purchase'
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isSearching && availableNumbers.length === 0 && searchArea && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">No numbers found</p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Try searching for a different area code or location to find available phone numbers.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
