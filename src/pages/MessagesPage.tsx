
import { PageLayout } from "@/components/layout/PageLayout";
import { MessageSquare } from "lucide-react";

const MessagesPage = () => {
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-fixlyfy-text-secondary">
          SMS messaging functionality has been removed.
        </p>
      </div>
      
      <div className="fixlyfy-card p-8 text-center">
        <div className="bg-fixlyfy/10 rounded-full p-6 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
          <MessageSquare className="h-12 w-12 text-fixlyfy" />
        </div>
        <h3 className="text-xl font-semibold text-fixlyfy-text mb-3">SMS Feature Disabled</h3>
        <p className="text-fixlyfy-text-secondary leading-relaxed max-w-md mx-auto">
          The SMS messaging functionality has been completely removed from this application. 
          This page is no longer functional.
        </p>
      </div>
    </PageLayout>
  );
};

export default MessagesPage;
