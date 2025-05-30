
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { loadNicheData } from "@/utils/niche-data-loader";
import { Profile } from "@/types/profile";

const referralSources = [
  { id: "social_media", label: "Social Media" },
  { id: "search_engine", label: "Search Engines" },
  { id: "recommendation", label: "Recommendations" },
  { id: "advertisement", label: "Advertisement" },
  { id: "other", label: "Other" }
];

const businessNiches = [
  { id: "appliance_repair", label: "Appliance Repair & Installation" },
  { id: "garage_door", label: "Garage Door Repair & Installation" },
  { id: "construction", label: "Construction" },
  { id: "hvac", label: "AC Repair & Installation" },
  { id: "plumbing", label: "Plumbing" },
  { id: "electrical", label: "Electrical" },
  { id: "other", label: "Other" }
];

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [referralSource, setReferralSource] = useState("");
  const [businessNiche, setBusinessNiche] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNextStep = () => {
    if (!referralSource) {
      toast.error("Please select an option");
      return;
    }
    setStep(2);
  };

  const handleComplete = async () => {
    if (!businessNiche) {
      toast.error("Please select a business niche");
      return;
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);
    try {
      // Update the user's profile with custom fields
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          referral_source: referralSource,
          business_niche: businessNiche
        } as Partial<Profile>, {
          onConflict: 'id'
        });
      
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }

      await loadNicheData(businessNiche);
      
      toast.success("Setup complete! Welcome to Fixlify!");
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during onboarding:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    navigate("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "How did you hear about us?" : "Select your business niche"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <RadioGroup value={referralSource} onValueChange={setReferralSource} className="space-y-3">
              {referralSources.map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={source.id} id={`source-${source.id}`} />
                  <Label htmlFor={`source-${source.id}`}>{source.label}</Label>
                </div>
              ))}
            </RadioGroup>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleNextStep}>Next</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <RadioGroup value={businessNiche} onValueChange={setBusinessNiche} className="space-y-3">
              {businessNiches.map((niche) => (
                <div key={niche.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={niche.id} id={`niche-${niche.id}`} />
                  <Label htmlFor={`niche-${niche.id}`}>{niche.label}</Label>
                </div>
              ))}
            </RadioGroup>
            
            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
                  Skip
                </Button>
                <Button onClick={handleComplete} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Complete"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
