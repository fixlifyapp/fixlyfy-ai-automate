
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Download, Grid, List, Loader2 } from "lucide-react";
import { ClientsList } from "@/components/clients/ClientsList";
import { ClientsFilters } from "@/components/clients/ClientsFilters";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { clients as realClients } from "@/data/real-clients";
import { Client } from "@/utils/test-data/types";

const ClientsPage = () => {
  const [isGridView, setIsGridView] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const handleImportRealClients = async () => {
    setIsImporting(true);
    try {
      toast.info("Starting import of real clients...");
      
      // Convert the real clients data to match the Supabase clients table schema
      const clientsToImport = realClients.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        status: client.status,
        type: client.type,
        rating: client.rating,
        city: client.address?.split(',')[1]?.trim().split(' ')[0] || "",
        state: client.address?.split(',')[1]?.trim().split(' ')[1] || "",
        zip: client.address?.split(',')[1]?.trim().split(' ')[2] || "",
        tags: [client.type],
      }));
      
      // Insert the clients into the Supabase database
      const { data, error } = await supabase
        .from('clients')
        .upsert(clientsToImport, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        throw error;
      }
      
      toast.success(`Successfully imported ${clientsToImport.length} clients!`);
      
      // Force reload the page to show the imported clients
      window.location.reload();
    } catch (error) {
      console.error("Error importing clients:", error);
      toast.error("Failed to import clients. Please check console for details.");
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-fixlyfy-text-secondary">
            Manage your customer database and track interactions.
          </p>
        </div>
        <Button 
          onClick={handleImportRealClients} 
          className="bg-fixlyfy hover:bg-fixlyfy/90"
          disabled={isImporting}
        >
          {isImporting ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" /> Importing...
            </>
          ) : (
            <>
              <Download size={18} className="mr-2" /> Import Real Clients
            </>
          )}
        </Button>
      </div>
      
      <div className="fixlyfy-card p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <ClientsFilters />
          <div className="flex items-center gap-2">
            <Button
              variant={isGridView ? "ghost" : "secondary"}
              size="sm"
              onClick={() => setIsGridView(false)}
              className="flex gap-2"
            >
              <List size={18} /> List
            </Button>
            <Button 
              variant={isGridView ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setIsGridView(true)}
              className="flex gap-2"
            >
              <Grid size={18} /> Grid
            </Button>
          </div>
        </div>
      </div>
      
      <ClientsList isGridView={isGridView} />
    </PageLayout>
  );
};

export default ClientsPage;
