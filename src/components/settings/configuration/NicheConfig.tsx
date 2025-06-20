
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { switchNiche } from "@/utils/niche-data-loader";
import { toast } from "sonner";

const businessNiches = [
  { id: "appliance_repair", label: "Appliance Repair & Installation" },
  { id: "garage_door", label: "Garage Door Repair & Installation" },
  { id: "construction", label: "Construction" },
  { id: "hvac", label: "AC Repair & Installation" },
  { id: "plumbing", label: "Plumbing" },
  { id: "electrical", label: "Electrical" },
  { id: "other", label: "Other" }
];

interface NicheConfigProps {
  userId?: string;
}

interface ProfileData {
  business_niche?: string;
  [key: string]: any;
}

export function NicheConfig({ userId }: NicheConfigProps) {
  const [currentNiche, setCurrentNiche] = useState<string>("");
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  useEffect(() => {
    const fetchCurrentNiche = async () => {
      if (!userId) return;
      
      try {
        // Fetch profile data from the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        
        const profileData = data as ProfileData;
        const niche = profileData?.business_niche || "appliance_repair";
        setCurrentNiche(niche);
        setSelectedNiche(niche);
      } catch (error) {
        console.error("Error fetching current niche:", error);
        toast.error("Failed to load your business niche settings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurrentNiche();
  }, [userId]);

  const handleSwitchNiche = async () => {
    if (!userId || selectedNiche === currentNiche || !selectedNiche) {
      return;
    }
    
    setIsSwitching(true);
    try {
      // Update the user's profile with the new niche
      await switchNiche(selectedNiche, userId);
      setCurrentNiche(selectedNiche);
      toast.success("Business niche updated successfully");
    } catch (error) {
      console.error("Error switching niche:", error);
      toast.error("Failed to update business niche");
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Business Niche</h2>
        <p className="text-muted-foreground">
          Select your business niche to customize the application with appropriate products, 
          job types, and other settings specific to your industry.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <Alert variant="default" className="bg-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Switching your business niche will reload the page and may affect your existing data.
              You can switch back at any time.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Current business niche:</h3>
              <div className="px-4 py-2 bg-muted rounded-md">
                {businessNiches.find(n => n.id === currentNiche)?.label || "Not set"}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Select new business niche:</h3>
              <RadioGroup 
                value={selectedNiche} 
                onValueChange={setSelectedNiche} 
                className="space-y-3"
              >
                {businessNiches.map((niche) => (
                  <div key={niche.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={niche.id} id={`niche-${niche.id}`} />
                    <Label htmlFor={`niche-${niche.id}`}>{niche.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <Button 
              onClick={handleSwitchNiche} 
              disabled={isSwitching || selectedNiche === currentNiche || !selectedNiche}
              className="mt-4"
            >
              {isSwitching ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Switching...
                </>
              ) : "Switch Business Niche"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
