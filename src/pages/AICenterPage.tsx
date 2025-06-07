
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, MessageSquare, Phone, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AICenterPage = () => {
  const navigate = useNavigate();

  const aiFeatures = [
    {
      title: "AI Assistant",
      description: "Intelligent virtual assistant for customer interactions",
      icon: MessageSquare,
      action: () => navigate("/connect"),
      status: "active"
    },
    {
      title: "Voice AI",
      description: "AI-powered phone system and call handling",
      icon: Phone,
      action: () => navigate("/settings/telnyx"),
      status: "active"
    },
    {
      title: "Analytics AI",
      description: "Predictive analytics and business insights",
      icon: BarChart3,
      action: () => navigate("/analytics"),
      status: "active"
    },
    {
      title: "Automations",
      description: "Smart workflow automation and triggers",
      icon: Zap,
      action: () => navigate("/automations"),
      status: "active"
    }
  ];

  return (
    <PageLayout>
      <PageHeader
        title="AI Center"
        subtitle="Manage and configure all AI-powered features"
        icon={Brain}
        badges={[
          { text: "AI Powered", icon: Brain, variant: "fixlyfy" },
          { text: "Real-time", icon: Zap, variant: "success" }
        ]}
      />
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-fixlyfy/10 p-2 rounded-lg">
                    <feature.icon className="h-6 w-6 text-fixlyfy" />
                  </div>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      feature.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm capitalize">{feature.status}</span>
                  </div>
                  <Button onClick={feature.action} variant="outline">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Configuration Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Voice AI Settings</div>
                  <div className="text-sm text-muted-foreground">Configure voice assistant and phone integration</div>
                </div>
                <Button variant="outline" onClick={() => navigate("/settings/telnyx")}>
                  Manage
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Message AI</div>
                  <div className="text-sm text-muted-foreground">Smart messaging and customer communication</div>
                </div>
                <Button variant="outline" onClick={() => navigate("/connect")}>
                  Manage
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Analytics & Insights</div>
                  <div className="text-sm text-muted-foreground">Predictive analytics and business intelligence</div>
                </div>
                <Button variant="outline" onClick={() => navigate("/analytics")}>
                  Manage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AICenterPage;
