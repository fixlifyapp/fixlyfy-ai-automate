
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ClientForm } from "@/components/clients/ClientForm";

const ClientFormPage = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <PageLayout>
      <ClientForm clientId={id} />
    </PageLayout>
  );
};

export default ClientFormPage;
