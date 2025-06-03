
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Link } from "react-router-dom";
import { Settings2, Shield, Sliders, User, Brain, Building2, Plug, Package, Mail, Zap, Phone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MailgunTestPanel } from "@/components/connect/MailgunTestPanel";

const SettingsPage = () => {
  const { user } = useAuth();
  
  return (
    <PageLayout>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and application preferences"
        icon={Settings2}
        badges={[
          { text: "Security", icon: Shield, variant: "fixlyfy" },
          { text: "Customization", icon: Sliders, variant: "success" },
          { text: "Profile Management", icon: User, variant: "info" }
        ]}
      />
      
      {/* Main Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile & Company Card */}
        <Link to="/profile-company">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <User className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Profile & Company</h3>
                <p className="text-sm text-muted-foreground">Manage personal information and company details</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Products Card */}
        <Link to="/products">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <Package className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Products</h3>
                <p className="text-sm text-muted-foreground">Manage your product catalog and inventory</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Phone Numbers Card */}
        <Link to="/phone-numbers">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <Phone className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Phone Numbers</h3>
                <p className="text-sm text-muted-foreground">Manage your phone numbers and communication settings</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Telnyx Card */}
        <Link to="/telnyx">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <Zap className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Telnyx</h3>
                <p className="text-sm text-muted-foreground">Configure Telnyx SMS and voice settings</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Integrations Card */}
        <Link to="/integrations">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <Plug className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Integrations</h3>
                <p className="text-sm text-muted-foreground">Connect with third-party services and tools</p>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Configuration Card */}
        <Link to="/configuration">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <Settings2 className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Configuration</h3>
                <p className="text-sm text-muted-foreground">Manage business niche, tags, job types, statuses, and custom fields</p>
              </div>
            </div>
          </div>
        </Link>
        
        {/* AI Settings Card */}
        <Link to="/ai-settings">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <Brain className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">AI Settings</h3>
                <p className="text-sm text-muted-foreground">Configure AI agent and automation settings</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Email Testing Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Quick Email Testing</h2>
          <p className="text-muted-foreground">
            Test your email configuration by sending a test email using the Mailgun integration
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Testing Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Send test emails to verify your Mailgun configuration. This uses the sandbox domain for testing.
            </p>
            <MailgunTestPanel />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
