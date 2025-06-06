
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Mail, MailX, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

interface ClientSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientSelect: (client: Client) => void;
}

export const ClientSelectionDialog = ({ open, onOpenChange, onClientSelect }: ClientSelectionDialogProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('id, name, email, phone, company')
        .eq('created_by', user.id)
        .order('name');

      if (error) throw error;
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleClientClick = (client: Client) => {
    if (!client.email) {
      toast.error(`${client.name} doesn't have an email address. Please add an email to send messages.`);
      return;
    }
    onClientSelect(client);
    onOpenChange(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-fixlyfy" />
            Select Client for Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted h-4 w-4" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8 text-fixlyfy-text-muted">
                Loading clients...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-fixlyfy-text-muted">
                <User className="h-8 w-8 mx-auto mb-2 text-fixlyfy-text-muted" />
                {searchTerm ? 'No clients found' : 'No clients available'}
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => handleClientClick(client)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-fixlyfy-border hover:bg-fixlyfy/5 cursor-pointer transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-fixlyfy/20 text-fixlyfy">
                      {client.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-fixlyfy-text truncate">
                      {client.name}
                    </div>
                    {client.company && (
                      <div className="text-sm text-fixlyfy-text-secondary truncate">
                        {client.company}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {client.email ? (
                        <div className="flex items-center gap-1 text-xs text-fixlyfy-text-muted">
                          <Mail className="h-3 w-3 text-green-500" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-red-500">
                          <MailX className="h-3 w-3" />
                          <span>No email</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!client.email && (
                    <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                      No Email
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
