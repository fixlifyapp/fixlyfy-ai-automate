
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PhoneNumbersPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Phone Numbers"
        subtitle="Manage your phone numbers and communication settings"
        icon={Phone}
        badges={[
          { text: "Voice", icon: Phone, variant: "fixlyfy" },
          { text: "SMS", icon: Phone, variant: "success" }
        ]}
      />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Numbers Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page is under construction. Phone number management features will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PhoneNumbersPage;
