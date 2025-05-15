
import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ClientForm } from "@/components/clients/ClientForm";

const ClientDetailPage = () => {
  const { id } = useParams();
  
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Client Details</h1>
        <p className="text-fixlyfy-text-secondary">
          View and manage client information.
        </p>
      </div>
      
      <ClientForm clientId={id} />
    </PageLayout>
  );
};

export default ClientDetailPage;
