
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneIcon, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PhoneNumberPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

export const PhoneNumberPurchaseDialog = ({
  open,
  onOpenChange,
  onSuccess,
  userId,
}: PhoneNumberPurchaseDialogProps) => {
  const [areaCode, setAreaCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);

  const handleSearch = async () => {
    if (!areaCode || areaCode.length !== 3) {
      toast.error("Please enter a valid 3-digit area code");
      return;
    }

    setIsSearching(true);
    setAvailableNumbers([]);
    setSelectedNumber(null);

    try {
      const { data, error } = await supabase.functions.invoke("twilio", {
        body: { action: "search", areaCode },
      });

      if (error) throw error;

      if (data.available_phone_numbers && data.available_phone_numbers.length > 0) {
        setAvailableNumbers(data.available_phone_numbers);
        toast.success(`Found ${data.available_phone_numbers.length} available numbers`);
      } else {
        toast.info("No available numbers found for this area code");
      }
    } catch (error) {
      console.error("Error searching for phone numbers:", error);
      toast.error("Failed to search for phone numbers");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedNumber || !userId) return;

    setIsPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke("twilio", {
        body: {
          action: "purchase",
          phoneNumberSid: selectedNumber.phone_number,
          userId,
        },
      });

      if (error) throw error;

      toast.success("Phone number purchased successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error purchasing phone number:", error);
      toast.error("Failed to purchase phone number");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase a Phone Number</DialogTitle>
          <DialogDescription>
            Get your own phone number to send SMS messages to clients. This will cost
            $10/month plus usage fees.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-end gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="areaCode">Area Code</Label>
              <Input
                id="areaCode"
                placeholder="e.g. 415"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
                maxLength={3}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !areaCode || areaCode.length !== 3}
              className="gap-2"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>

          {availableNumbers.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                        Phone Number
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                        Select
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableNumbers.map((number, index) => (
                      <tr
                        key={number.phone_number}
                        className={`border-t ${
                          selectedNumber?.phone_number === number.phone_number
                            ? "bg-fixlyfy bg-opacity-10"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-2 text-sm">{number.friendly_name}</td>
                        <td className="px-4 py-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedNumber(number)}
                            className="h-8 gap-1"
                          >
                            {selectedNumber?.phone_number === number.phone_number ? (
                              "Selected"
                            ) : (
                              <>
                                <PhoneIcon className="h-3 w-3" /> Select
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPurchasing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={!selectedNumber || isPurchasing}
            className="gap-2"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Purchasing...
              </>
            ) : (
              <>
                <PhoneIcon className="h-4 w-4" /> Purchase ($10/month)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
