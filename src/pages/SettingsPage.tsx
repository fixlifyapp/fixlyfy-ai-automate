
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsGeneral } from "@/components/settings/SettingsGeneral";
import { SettingsUserCompany } from "@/components/settings/SettingsUserCompany";
import { SettingsIntegrations } from "@/components/settings/SettingsIntegrations";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Shield, Sliders, User, Phone, Brain } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  
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
      
      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
        
        {/* Phone Numbers Card */}
        <Link to="/phone-numbers">
          <div className="h-full hover:shadow-md transition-shadow fixlyfy-card cursor-pointer">
            <div className="flex items-center p-6 space-x-4">
              <div className="bg-fixlyfy/10 p-3 rounded-full">
                <Phone className="h-6 w-6 text-fixlyfy" />
              </div>
              <div>
                <h3 className="font-medium">Phone Numbers</h3>
                <p className="text-sm text-muted-foreground">Purchase and manage business phone numbers</p>
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
      
      <div className="fixlyfy-card overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 h-auto p-0 bg-fixlyfy-bg-interface">
            <TabsTrigger 
              value="general" 
              className="py-4 rounded-none data-[state=active]:bg-white"
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="py-4 rounded-none data-[state=active]:bg-white"
            >
              Profile & Company
            </TabsTrigger>
            <TabsTrigger 
              value="integrations" 
              className="py-4 rounded-none data-[state=active]:bg-white"
            >
              Integrations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="p-6">
            <SettingsGeneral />
          </TabsContent>
          
          <TabsContent value="profile" className="p-6">
            <SettingsUserCompany />
          </TabsContent>
          
          <TabsContent value="integrations" className="p-6">
            <SettingsIntegrations />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
