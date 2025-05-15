
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  MoreVertical, 
  Pencil,
  Eye, 
  Mail, 
  Phone, 
  FileText, 
  Trash,
  Star
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface ClientsListProps {
  isGridView: boolean;
}

const clients = [
  {
    id: "CLT-1001",
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "(555) 123-4567",
    status: "active",
    lastOrder: "2023-05-10",
    revenue: 1250.00,
    address: "123 Main St, Apt 45, Boston, MA",
    rating: 5,
    type: "Residential"
  },
  {
    id: "CLT-1002",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "(555) 987-6543",
    status: "active",
    lastOrder: "2023-05-15",
    revenue: 2750.00,
    address: "456 Oak Ave, New York, NY",
    rating: 4,
    type: "Residential"
  },
  {
    id: "CLT-1003",
    name: "Apex Construction Inc.",
    email: "info@apexconstruction.com",
    phone: "(555) 765-4321",
    status: "active",
    lastOrder: "2023-05-01",
    revenue: 12500.00,
    address: "789 Business Park, Chicago, IL",
    rating: 5,
    type: "Commercial"
  },
  {
    id: "CLT-1004",
    name: "Jessica Miller",
    email: "jessica.miller@example.com",
    phone: "(555) 234-5678",
    status: "inactive",
    lastOrder: "2023-03-20",
    revenue: 350.00,
    address: "321 Elm St, San Francisco, CA",
    rating: 3,
    type: "Residential"
  },
  {
    id: "CLT-1005",
    name: "Highland Property Management",
    email: "contact@highlandpm.com",
    phone: "(555) 876-5432",
    status: "active",
    lastOrder: "2023-05-17",
    revenue: 8750.00,
    address: "555 Highland Ave, Seattle, WA",
    rating: 4,
    type: "Property Manager"
  },
];

export const ClientsList = ({ isGridView }: ClientsListProps) => {
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
            <Link to={`/clients/${client.id}`} key={client.id} className="fixlyfy-card hover:shadow-lg transition-shadow">
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
                  <Button variant="outline" size="sm" className="text-fixlyfy border-fixlyfy/20">
                    View
                  </Button>
                </div>
              </div>
            </Link>
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
                  className={idx % 2 === 0 ? "bg-white" : "bg-fixlyfy-bg-interface/50"}
                >
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Link to={`/clients/${client.id}`} className="font-medium hover:text-fixlyfy transition-colors">
                      {client.id}
                    </Link>
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye size={16} className="mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil size={16} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail size={16} className="mr-2" /> Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText size={16} className="mr-2" /> Create Job
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
