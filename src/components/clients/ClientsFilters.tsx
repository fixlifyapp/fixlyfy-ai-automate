
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export const ClientsFilters = () => {
  return (
    <div className="flex flex-wrap gap-3 items-center flex-1">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-secondary" size={18} />
        <Input placeholder="Search clients..." className="pl-10" />
      </div>
      
      <Select defaultValue="all">
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Client Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Clients</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="leads">Leads</SelectItem>
        </SelectContent>
      </Select>
      
      <Select defaultValue="all-time">
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Last Interaction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-time">All Time</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="last-month">Last Month</SelectItem>
          <SelectItem value="this-year">This Year</SelectItem>
        </SelectContent>
      </Select>
      
      <Button variant="outline" size="icon">
        <Filter size={18} />
      </Button>
    </div>
  );
};
