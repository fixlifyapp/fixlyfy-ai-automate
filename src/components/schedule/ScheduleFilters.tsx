
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";

export interface ScheduleFiltersProps {
  view: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
}

export const ScheduleFilters = ({ view, onViewChange }: ScheduleFiltersProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  
  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  return (
    <div className="flex flex-wrap gap-3 items-center flex-1">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePrevious}>
          <ChevronLeft size={18} />
        </Button>
        <Button variant="outline" onClick={handleToday}>
          Today
        </Button>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight size={18} />
        </Button>
        <div className="text-base font-medium ml-2">
          {format(currentDate, 'MMMM yyyy')}
        </div>
      </div>
      
      <div className="ml-auto flex flex-wrap gap-3 items-center">
        <Select value={view} onValueChange={(v) => onViewChange(v as 'day' | 'week' | 'month')}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day View</SelectItem>
            <SelectItem value="week">Week View</SelectItem>
            <SelectItem value="month">Month View</SelectItem>
          </SelectContent>
        </Select>
        
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Technicians" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technicians</SelectItem>
            <SelectItem value="robert-smith">Robert Smith</SelectItem>
            <SelectItem value="john-doe">John Doe</SelectItem>
            <SelectItem value="emily-clark">Emily Clark</SelectItem>
          </SelectContent>
        </Select>
        
        <Select defaultValue="all-jobs">
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-jobs">All Jobs</SelectItem>
            <SelectItem value="hvac">HVAC</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
