
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  MoreVertical, 
  Eye, 
  Trash,
  Mail,
  Phone,
  FileDown,
  Edit,
  Loader2,
  MessageSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Client } from "@/utils/test-data/types";

interface ClientsListProps {
  isGridView: boolean;
}

export const ClientsList = ({ isGridView }: ClientsListProps) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch clients from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          // Format the client IDs for display
          const formattedClients = data.map((client, index) => ({
            ...client,
            displayId: `C-${1001 + index}`
          }));
          
          setClients(formattedClients);
          console.log("Fetched clients:", formattedClients);
        } else {
          setClients([]);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };
  
  const handleCheckboxChange = (clientId: string) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(client => client.id || ''));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkEdit = () => {
    // This would open a bulk edit modal in a real implementation
    toast.info(`Editing ${selectedClients.length} clients`);
  };

  const handleMessageClient = (clientId: string) => {
    navigate(`/connect/messages?client=${clientId}`);
  };

  const handleExportClients = () => {
    // Export selected or all clients
    const exportData = selectedClients.length > 0 
      ? clients.filter(client => client.id && selectedClients.includes(client.id))
      : clients;
      
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Client ID,Name,Email,Phone,Status,Type\n"
      + exportData.map(client => 
          `${client.id},${client.name},${client.email || ''},${client.phone || ''},${client.status || ''},${client.type || ''}`
        ).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clients_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDisplayId = (client: any) => {
    return client.displayId || client.id?.substring(0, 8) || '';
  };

  if (isLoading) {
    return (
      <div className="fixlyfy-card p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-fixlyfy animate-spin mr-2" />
        <p>Loading clients...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="fixlyfy-card p-8 text-center">
        <p className="text-fixlyfy-text-secondary mb-4">No clients found</p>
        <p className="text-sm">Import clients or create new ones to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedClients.length > 0 && (
        <div className="fixlyfy-card p-2 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{selectedClients.length} clients selected</span>
            <Button 
              variant="outline" 
              size="sm"
              className="flex gap-2 ml-2 border-fixlyfy/20 text-fixlyfy"
              onClick={handleBulkEdit}
            >
              <Edit size={16} /> Bulk Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex gap-2 border-fixlyfy/20 text-fixlyfy"
              onClick={handleExportClients}
            >
              <FileDown size={16} /> Export Selected
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-fixlyfy-text-secondary"
            onClick={() => setSelectedClients([])}
          >
            Clear Selection
          </Button>
        </div>
      )}
      
      {isGridView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="fixlyfy-card hover:shadow-lg transition-shadow relative"
            >
              <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={selectedClients.includes(client.id || '')} 
                  onCheckedChange={() => handleCheckboxChange(client.id || '')}
                />
              </div>
              <div
                className="p-4 border-b border-fixlyfy-border cursor-pointer"
                onClick={() => client.id && handleClientClick(client.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {getDisplayId(client)}
                    </Badge>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-xs text-fixlyfy-text-secondary">{client.address}</p>
                  </div>
                  
                  <Badge className={cn(
                    client.status === "active" && "bg-fixlyfy-success/10 text-fixlyfy-success",
                    client.status === "inactive" && "bg-fixlyfy-text-secondary/10 text-fixlyfy-text-secondary"
                  )}>
                    {client.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-3">
                  <Badge className="bg-fixlyfy/10 text-fixlyfy">{client.type}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail size={14} className="text-fixlyfy-text-secondary mr-2" />
                    <span className="text-fixlyfy-text-secondary">{client.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone size={14} className="text-fixlyfy-text-secondary mr-2" />
                    <span className="text-fixlyfy-text-secondary">{client.phone}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-fixlyfy-text-secondary">Client ID:</span>
                    <span className="ml-2 font-medium">{getDisplayId(client)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-fixlyfy border-fixlyfy/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        client.id && handleClientClick(client.id);
                      }}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-indigo-500 border-indigo-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        client.id && client.phone && handleMessageClient(client.id);
                      }}
                    >
                      <MessageSquare size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="fixlyfy-card overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-fixlyfy-border">
            <div className="text-sm font-medium">All Clients ({clients.length})</div>
            <Button 
              variant="outline" 
              size="sm"
              className="flex gap-2 border-fixlyfy/20 text-fixlyfy"
              onClick={handleExportClients}
            >
              <FileDown size={16} /> Export All
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectAll} 
                    onCheckedChange={handleSelectAllChange}
                  />
                </TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client, idx) => (
                <TableRow 
                  key={client.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-fixlyfy-bg-interface/50"}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedClients.includes(client.id || '')} 
                      onCheckedChange={() => handleCheckboxChange(client.id || '')}
                    />
                  </TableCell>
                  <TableCell>
                    <span 
                      className="font-medium hover:text-fixlyfy transition-colors cursor-pointer"
                      onClick={() => client.id && handleClientClick(client.id)}
                    >
                      {getDisplayId(client)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div 
                      className="font-medium cursor-pointer"
                      onClick={() => client.id && handleClientClick(client.id)}
                    >
                      {client.name}
                    </div>
                    <div className="text-xs text-fixlyfy-text-secondary truncate max-w-[200px]">
                      {client.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{client.email}</div>
                    <div className="text-sm">{client.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      client.status === "active" && "bg-fixlyfy-success/10 text-fixlyfy-success",
                      client.status === "inactive" && "bg-fixlyfy-text-secondary/10 text-fixlyfy-text-secondary"
                    )}>
                      {client.status || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-fixlyfy/10 text-fixlyfy">
                      {client.type || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => client.id && client.phone && handleMessageClient(client.id)}
                        title="Message Client"
                      >
                        <MessageSquare size={16} className="text-indigo-500" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => client.id && handleClientClick(client.id)}>
                            <Eye size={16} className="mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkEdit()}>
                            <Edit size={16} className="mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-fixlyfy-error">
                            <Trash size={16} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};
