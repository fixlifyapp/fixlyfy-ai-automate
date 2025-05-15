
import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ReportsFiltersProps {
  period: string;
  setPeriod: (period: string) => void;
}

export const ReportsFilters = ({ period, setPeriod }: ReportsFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        
        <Select defaultValue="all-services">
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-services">All Services</SelectItem>
            <SelectItem value="hvac">HVAC</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="icon">
          <Filter size={18} />
        </Button>
      </div>
      
      <div>
        <Button variant="outline" className="gap-2">
          <Download size={18} /> Export
        </Button>
      </div>
    </div>
  );
};
