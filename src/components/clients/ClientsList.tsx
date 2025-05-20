import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  MoreVertical, 
  Eye, 
  Trash,
  Star,
  Mail,
  Phone,
  FileDown,
  Edit
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
import { clients } from "@/data/real-clients";

interface ClientsListProps {
  isGridView: boolean;
}

export const ClientsList = ({ isGridView }: ClientsListProps) => {
  const navigate = useNavigate();
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

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
      setSelectedClients(clients.map(client => client.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkEdit = () => {
    // This would open a bulk edit modal in a real implementation
    alert(`Editing ${selectedClients.length} clients`);
  };

  const handleExportClients = () => {
    // In a real implementation, we would generate CSV/Excel with client data
    const exportData = selectedClients.length > 0 
      ? clients.filter(client => selectedClients.includes(client.id))
      : clients;
      
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Client ID,Name,Email,Phone,Status,Type,Revenue,Rating\n"
      + exportData.map(client => 
          `${client.id},${client.name},${client.email},${client.phone},${client.status},${client.type},${client.revenue},${client.rating}`
        ).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clients_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRatingStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i}
        size={14} 
        className={i < rating ? "text-fixlyfy-warning fill-fixlyfy-warning" : "text-fixlyfy-text-secondary"}
      />
    ));
  };

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
                  checked={selectedClients.includes(client.id)} 
                  onCheckedChange={() => handleCheckboxChange(client.id)}
                />
              </div>
              <div
                className="p-4 border-b border-fixlyfy-border cursor-pointer"
                onClick={() => handleClientClick(client.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {client.id}
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
                <div className="flex items-center mb-3">
                  <div className="flex">
                    {getRatingStars(client.rating)}
                  </div>
                  <Badge className="ml-2 bg-fixlyfy/10 text-fixlyfy">{client.type}</Badge>
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
                    <span className="text-fixlyfy-text-secondary">Lifetime Value:</span>
                    <span className="ml-2 font-medium">${client.revenue.toFixed(2)}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-fixlyfy border-fixlyfy/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClientClick(client.id);
                    }}
                  >
                    View
                  </Button>
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
                <TableHead>Lifetime Value</TableHead>
                <TableHead>Rating</TableHead>
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
                      checked={selectedClients.includes(client.id)} 
                      onCheckedChange={() => handleCheckboxChange(client.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <span 
                      className="font-medium hover:text-fixlyfy transition-colors cursor-pointer"
                      onClick={() => handleClientClick(client.id)}
                    >
                      {client.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div 
                      className="font-medium cursor-pointer"
                      onClick={() => handleClientClick(client.id)}
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
                      {client.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-fixlyfy/10 text-fixlyfy">
                      {client.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${client.revenue.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      {getRatingStars(client.rating)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleClientClick(client.id)}>
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
