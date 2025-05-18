
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { DateRange } from "react-day-picker";
import { addDays, format, subDays } from "date-fns";
import { Calendar } from "lucide-react";
import { ModuleType } from "@/types/audit";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface AuditLogFiltersProps {
  onFilterChange: (
    dateRange: DateRange | undefined,
    user: string,
    module: ModuleType
  ) => void;
}

interface FilterValues {
  dateRange: DateRange | undefined;
  user: string;
  module: ModuleType;
}

export const AuditLogFilters = ({ onFilterChange }: AuditLogFiltersProps) => {
  const [open, setOpen] = useState(false);

  const defaultValues: FilterValues = {
    dateRange: {
      from: subDays(new Date(), 7),
      to: new Date(),
    },
    user: "",
    module: "all",
  };

  const form = useForm<FilterValues>({
    defaultValues,
  });

  const onSubmit = (values: FilterValues) => {
    onFilterChange(
      values.dateRange,
      values.user,
      values.module
    );
  };

  // Apply default filters on mount
  useState(() => {
    onFilterChange(
      defaultValues.dateRange,
      defaultValues.user,
      defaultValues.module
    );
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-muted/30 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Range</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      defaultMonth={field.value?.from}
                      selected={field.value}
                      onSelect={(range) => {
                        field.onChange(range);
                        if (range?.to) {
                          setOpen(false);
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User</FormLabel>
                <FormControl>
                  <Input placeholder="Search by user name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="module"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Module</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    <SelectItem value="jobs">Jobs</SelectItem>
                    <SelectItem value="clients">Clients</SelectItem>
                    <SelectItem value="payments">Payments</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="automations">Automations</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">Apply Filters</Button>
        </div>
      </form>
    </Form>
  );
};
