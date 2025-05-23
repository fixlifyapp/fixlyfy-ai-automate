
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { switchNiche } from "@/utils/niche-data-loader";

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

export function NicheConfig({ userId }: NicheConfigProps) {
  const [currentNiche, setCurrentNiche] = useState<string>("");
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  useEffect(() => {
    const fetchCurrentNiche = async () => {
      if (!userId) return;
      
      try {
        // Use RPC function to get profile data including business_niche
        const { data, error } = await supabase.rpc('get_profile_data');
        
        if (error) throw error;
        
        const niche = data?.business_niche || "appliance_repair";
        setCurrentNiche(niche);
        setSelectedNiche(niche);
      } catch (error) {
        console.error("Error fetching current niche:", error);
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
      await switchNiche(selectedNiche, userId);
      setCurrentNiche(selectedNiche);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Niche</CardTitle>
        <CardDescription>
          Select your business niche to customize the application with appropriate products, 
          job types, and other settings specific to your industry.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Alert>
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
      </CardContent>
    </Card>
  );
}
