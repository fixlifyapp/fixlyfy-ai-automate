
import { useState } from "react";
import { AuditLogEntry } from "@/types/audit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AuditLogTableProps {
  entries: AuditLogEntry[];
}

type SortField = "timestamp" | "userName" | "action" | "module" | "recordId";
type SortDirection = "asc" | "desc";

export const AuditLogTable = ({ entries }: AuditLogTableProps) => {
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "timestamp":
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case "userName":
        comparison = a.userName.localeCompare(b.userName);
        break;
      case "action":
        comparison = a.action.localeCompare(b.action);
        break;
      case "module":
        comparison = a.module.localeCompare(b.module);
        break;
      case "recordId":
        comparison = a.recordId.localeCompare(b.recordId);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const getModuleColor = (module: string) => {
    switch (module) {
      case "jobs":
        return "bg-blue-500";
      case "clients":
        return "bg-green-500";
      case "payments":
        return "bg-yellow-500";
      case "team":
        return "bg-purple-500";
      case "settings":
        return "bg-gray-500";
      case "products":
        return "bg-orange-500";
      case "automations":
        return "bg-indigo-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort("timestamp")} className="cursor-pointer">
              <div className="flex items-center">
                Timestamp
                {sortField === "timestamp" && (
                  sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("userName")} className="cursor-pointer">
              <div className="flex items-center">
                User
                {sortField === "userName" && (
                  sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("action")} className="cursor-pointer">
              <div className="flex items-center">
                Action
                {sortField === "action" && (
                  sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("module")} className="cursor-pointer">
              <div className="flex items-center">
                Module
                {sortField === "module" && (
                  sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("recordId")} className="cursor-pointer">
              <div className="flex items-center">
                Record ID
                {sortField === "recordId" && (
                  sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </div>
            </TableHead>
            <TableHead>Change Summary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-32">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-muted-foreground">No audit log entries found</p>
                  <Button variant="outline" className="mt-2">Clear Filters</Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sortedEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(entry.timestamp), "MMM d, yyyy h:mm a")}
                </TableCell>
                <TableCell>{entry.userName}</TableCell>
                <TableCell className="capitalize">{entry.action.replace(/_/g, " ")}</TableCell>
                <TableCell>
                  <Badge className={getModuleColor(entry.module) + " text-white"}>
                    {entry.module}
                  </Badge>
                </TableCell>
                <TableCell>{entry.recordId}</TableCell>
                <TableCell>{entry.changeDescription}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
