import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useJobTypes } from "@/hooks/useConfigItems";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
export interface ScheduleFiltersProps {
  view: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
}
export const ScheduleFilters = ({
  view,
  onViewChange
}: ScheduleFiltersProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const {
    items: jobTypes,
    isLoading: jobTypesLoading
  } = useJobTypes();
  const [selectedJobType, setSelectedJobType] = useState("all-jobs");
  const [dateRange, setDateRange] = useState("today");
  const [customDate, setCustomDate] = useState<Date | undefined>(new Date());

  // Fetch technicians from Supabase
  useEffect(() => {
    async function fetchTechnicians() {
      try {
        setIsLoading(true);
        const {
          data,
          error
        } = await supabase.from('profiles').select('id, name, role').eq('role', 'technician');
        if (error) throw error;
        setTechnicians(data || []);
      } catch (error) {
        console.error("Error loading technicians:", error);
        toast.error("Failed to load technicians");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTechnicians();
  }, []);

  // Apply date range selection
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    let newDate = new Date();
    switch (range) {
      case 'today':
        setCurrentDate(new Date());
        break;
      case 'yesterday':
        setCurrentDate(subDays(new Date(), 1));
        break;
      case 'week':
        setCurrentDate(subDays(new Date(), 7));
        break;
      case 'month':
        setCurrentDate(subDays(new Date(), 30));
        break;
      case 'custom':
        // Keep current date and open calendar
        break;
      default:
        setCurrentDate(new Date());
    }
  };
  const handleCustomDateChange = (date: Date | undefined) => {
    if (date) {
      setCustomDate(date);
      setCurrentDate(date);
    }
  };
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
    setDateRange('today');
  };
  return <div className="flex flex-wrap gap-3 items-center flex-1">
      
      
      <div className="ml-auto flex flex-wrap gap-3 items-center">
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        
        {dateRange === 'custom' && <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[140px]">
                {customDate ? format(customDate, 'PP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={customDate} onSelect={handleCustomDateChange} initialFocus className="pointer-events-auto" />
            </PopoverContent>
          </Popover>}
        
        <Select value={view} onValueChange={v => onViewChange(v as 'day' | 'week' | 'month')}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day View</SelectItem>
            <SelectItem value="week">Week View</SelectItem>
            <SelectItem value="month">Month View</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedTechnician} onValueChange={setSelectedTechnician} disabled={isLoading}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Technicians" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technicians</SelectItem>
            {technicians.map(tech => <SelectItem key={tech.id} value={tech.id}>
                {tech.name}
              </SelectItem>)}
          </SelectContent>
        </Select>
        
        <Select value={selectedJobType} onValueChange={setSelectedJobType} disabled={jobTypesLoading}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-jobs">All Jobs</SelectItem>
            {jobTypes.map(type => <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      {/* Status legend */}
      <div className="w-full flex items-center gap-3 mt-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-fixlyfy"></span>
          <span className="text-xs">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-fixlyfy-warning"></span>
          <span className="text-xs">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-fixlyfy-success"></span>
          <span className="text-xs">Completed</span>
        </div>
      </div>
    </div>;
};