
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
  Phone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { clients } from "@/data/clients";

interface ClientsListProps {
  isGridView: boolean;
}

export const ClientsList = ({ isGridView }: ClientsListProps) => {
  const navigate = useNavigate();

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
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
      {isGridView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => handleClientClick(client.id)}
              className="fixlyfy-card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-4 border-b border-fixlyfy-border">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox />
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
                  className={idx % 2 === 0 ? "bg-white cursor-pointer" : "bg-fixlyfy-bg-interface/50 cursor-pointer"}
                  onClick={() => handleClientClick(client.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium hover:text-fixlyfy transition-colors">
                      {client.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-xs text-fixlyfy-text-secondary truncate max-w-[200px]">{client.address}</div>
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
