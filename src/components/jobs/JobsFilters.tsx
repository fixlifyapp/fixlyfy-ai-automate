
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const JobsFilters = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-1">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-secondary" size={18} />
        <Input placeholder="Search jobs..." className="pl-10" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Technician" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Technicians</SelectItem>
              <SelectItem value="robert">Robert Smith</SelectItem>
              <SelectItem value="john">John Doe</SelectItem>
              <SelectItem value="emily">Emily Clark</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
