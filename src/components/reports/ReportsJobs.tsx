
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ReportsJobsProps {
  period: string;
}

const jobsData = [
  {
    id: "JOB-1001",
    client: "Michael Johnson",
    service: "HVAC Repair",
    technician: "Robert Smith",
    date: new Date(2025, 4, 15),
    status: "completed",
    revenue: 350.00,
    duration: 125, // minutes
  },
  {
    id: "JOB-1002",
    client: "Sarah Williams",
    service: "Plumbing",
    technician: "John Doe",
    date: new Date(2025, 4, 16),
    status: "completed",
    revenue: 280.00,
    duration: 95, // minutes
  },
  {
    id: "JOB-1003",
    client: "David Brown",
    service: "Electrical",
    technician: "Emily Clark",
    date: new Date(2025, 4, 17),
    status: "completed",
    revenue: 220.00,
    duration: 85, // minutes
  },
  {
    id: "JOB-1004",
    client: "Apex Construction Inc.",
    service: "HVAC Installation",
    technician: "Robert Smith",
    date: new Date(2025, 4, 18),
    status: "completed",
    revenue: 1450.00,
    duration: 360, // minutes
  },
  {
    id: "JOB-1005",
    client: "Jessica Miller",
    service: "Plumbing",
    technician: "John Doe",
    date: new Date(2025, 4, 19),
    status: "completed",
    revenue: 195.00,
    duration: 75, // minutes
  },
];

export const ReportsJobs = ({ period }: ReportsJobsProps) => {
  return (
    <div className="fixlyfy-card">
      <div className="p-6 border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Recent Completed Jobs</h2>
      </div>
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobsData.map((job, idx) => (
              <TableRow 
                key={job.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-fixlyfy-bg-interface/50"}
              >
                <TableCell className="font-medium">
                  {job.id}
                </TableCell>
                <TableCell>
                  {job.client}
                </TableCell>
                <TableCell>
                  <Badge className="bg-fixlyfy/10 text-fixlyfy">
                    {job.service}
                  </Badge>
                </TableCell>
                <TableCell>
                  {job.technician}
                </TableCell>
                <TableCell>
                  {format(job.date, 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {Math.floor(job.duration / 60)}h {job.duration % 60}m
                </TableCell>
                <TableCell className="font-medium">
                  ${job.revenue.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
