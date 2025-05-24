
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Plus, Settings } from "lucide-react";

const AutomationsPage = () => {
  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Automations</h1>
            <p className="text-fixlyfy-text-secondary">
              Automate your workflows and increase efficiency.
            </p>
          </div>
          <Button className="bg-fixlyfy hover:bg-fixlyfy/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Automation
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Email Notifications</CardTitle>
              <Zap className="h-5 w-5 text-fixlyfy" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically send email notifications for job updates.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Active</span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Invoice Reminders</CardTitle>
              <Zap className="h-5 w-5 text-fixlyfy" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Send automatic reminders for overdue invoices.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Inactive</span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Job Assignment</CardTitle>
              <Zap className="h-5 w-5 text-fixlyfy" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically assign jobs based on technician availability.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Active</span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AutomationsPage;
