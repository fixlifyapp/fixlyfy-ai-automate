
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { AuditLogFilters } from "@/components/audit/AuditLogFilters";
import { AuditLogTable } from "@/components/audit/AuditLogTable";
import { AuditLogEntry, ModuleType } from "@/types/audit";
import { sampleAuditLogEntries } from "@/data/auditLogData";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(sampleAuditLogEntries);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>(sampleAuditLogEntries);

  const handleDownloadCSV = () => {
    // In a real app, this would generate and download a CSV file
    toast.success("Exporting audit log to CSV");
    console.log("Exporting audit logs:", filteredLogs);
  };

  const applyFilters = (
    dateRange: DateRange | undefined,
    user: string,
    module: ModuleType
  ) => {
    let filtered = [...auditLogs];

    if (dateRange?.from) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter(log => new Date(log.timestamp) >= from);
    }

    if (dateRange?.to) {
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.timestamp) <= to);
    }

    if (user.trim()) {
      const userLower = user.toLowerCase();
      filtered = filtered.filter(
        log => log.userName.toLowerCase().includes(userLower)
      );
    }

    if (module !== "all") {
      filtered = filtered.filter(log => log.module === module);
    }

    setFilteredLogs(filtered);
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <Button
            onClick={handleDownloadCSV}
            variant="outline"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
        <p className="text-muted-foreground">
          Track all system activities and changes
        </p>
      </div>

      <AuditLogFilters onFilterChange={applyFilters} />

      <div className="mt-6">
        <AuditLogTable entries={filteredLogs} />
      </div>
    </PageLayout>
  );
}
