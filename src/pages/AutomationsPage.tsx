
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const AutomationsPage = () => {
  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automations</h1>
          <p className="text-fixlyfy-text-secondary">
            Create workflows to automate repetitive tasks and notifications.
          </p>
        </div>
        <Button className="bg-fixlyfy hover:bg-fixlyfy/90">
          <Plus size={18} className="mr-2" /> Create Workflow
        </Button>
      </div>
      
      <div className="fixlyfy-card p-6 flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold mb-2">Business Automation</h2>
        <p className="text-fixlyfy-text-secondary text-center max-w-md mb-4">
          Set up triggers and actions to automate reminders, follow-ups, and routine tasks.
        </p>
        <Button variant="outline" className="mb-4">
          <Plus size={18} className="mr-2" /> Create Your First Automation
        </Button>
        <p className="text-sm text-fixlyfy-text-muted">
          This module is coming soon with complete functionality.
        </p>
      </div>
    </PageLayout>
  );
};

export default AutomationsPage;
