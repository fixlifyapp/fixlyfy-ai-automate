
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const DocumentsPage = () => {
  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-fixlyfy-text-secondary">
            Manage contracts, estimates, and other important files.
          </p>
        </div>
        <Button className="bg-fixlyfy hover:bg-fixlyfy/90">
          <Plus size={18} className="mr-2" /> Upload Document
        </Button>
      </div>
      
      <div className="fixlyfy-card p-6 flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold mb-2">Document Management</h2>
        <p className="text-fixlyfy-text-secondary text-center max-w-md mb-4">
          Store, organize, and share important documents with your team and clients.
        </p>
        <Button variant="outline" className="mb-4">
          <Plus size={18} className="mr-2" /> Upload Your First Document
        </Button>
        <p className="text-sm text-fixlyfy-text-muted">
          This module is coming soon with complete functionality.
        </p>
      </div>
    </PageLayout>
  );
};

export default DocumentsPage;
