
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusSelectorProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

export const StatusSelector = ({ currentStatus, onStatusChange }: StatusSelectorProps) => {
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "scheduled", label: "Scheduled" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
  ];

  return (
    <Select value={currentStatus} onValueChange={onStatusChange}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
