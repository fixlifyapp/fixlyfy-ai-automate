
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

const referralSources = [
  { id: "social_media", label: "Социальные сети" },
  { id: "search_engine", label: "Поисковые системы" },
  { id: "recommendation", label: "Рекомендации" },
  { id: "advertisement", label: "Реклама" },
  { id: "other", label: "Другое" }
];

const businessNiches = [
  { id: "appliance_repair", label: "Ремонт и установка бытовой техники" },
  { id: "garage_door", label: "Ремонт и установка гаражных ворот" },
  { id: "construction", label: "Строительство" },
  { id: "hvac", label: "Ремонт и установка кондиционеров" },
  { id: "plumbing", label: "Сантехника" },
  { id: "electrical", label: "Электромонтаж" },
  { id: "other", label: "Другое" }
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
      toast.error("Пожалуйста, выберите вариант");
      return;
    }
    setStep(2);
  };

  const handleComplete = async () => {
    if (!businessNiche) {
      toast.error("Пожалуйста, выберите нишу бизнеса");
      return;
    }

    if (!user) {
      toast.error("Пользователь не авторизован");
      return;
    }

    setIsLoading(true);
    try {
      // Save user preferences to profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          referral_source: referralSource,
          business_niche: businessNiche
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Load data for the selected niche
      await loadNicheData(businessNiche);
      
      toast.success("Настройка завершена! Добро пожаловать в Fixlyfy!");
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during onboarding:", error);
      toast.error("Что-то пошло не так. Пожалуйста, попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Как вы узнали о нас?" : "Выберите вашу сферу деятельности"}
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
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleNextStep}>Далее</Button>
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
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading}>
                Назад
              </Button>
              <Button onClick={handleComplete} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  "Завершить"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
