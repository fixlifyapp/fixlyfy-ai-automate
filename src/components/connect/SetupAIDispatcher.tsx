
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Bot, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const SetupAIDispatcher = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const handleSetup = async () => {
    setIsSettingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-ai-dispatcher-number', {
        body: {}
      });

      if (error) throw error;

      if (data.success) {
        setSetupComplete(true);
        toast({
          title: "AI Dispatcher Setup Complete!",
          description: `Phone number ${data.phone_number} is now ready to receive calls with AI assistance.`,
        });
      } else {
        throw new Error(data.error || 'Setup failed');
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: "Setup Failed",
        description: "Failed to set up AI dispatcher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <Card className="border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-gray-900">AI Dispatcher Setup</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Phone className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Phone Number: +1 833-574-3145</h3>
              <p className="text-sm text-blue-700">Toll-free number for AI dispatcher testing</p>
            </div>
          </div>

          {!setupComplete ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">This will set up:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Add +1 833-574-3145 as a purchased phone number</li>
                  <li>Enable AI dispatcher for incoming calls</li>
                  <li>Configure Amazon Connect integration</li>
                  <li>Set up AI agent with your business details</li>
                </ul>
              </div>

              <Button 
                onClick={handleSetup} 
                disabled={isSettingUp}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up AI Dispatcher...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Set Up AI Dispatcher
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Setup Complete!</h3>
                  <p className="text-sm text-green-700">AI dispatcher is ready to handle calls</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-2">What happens when you call +1 833-574-3145:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Amazon Connect receives the call</li>
                      <li>The call is routed to the AI dispatcher webhook</li>
                      <li>OpenAI processes the conversation and generates responses</li>
                      <li>Text-to-speech converts AI responses to voice</li>
                      <li>Call details are logged in the database</li>
                      <li>If an appointment is needed, it can be scheduled automatically</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
