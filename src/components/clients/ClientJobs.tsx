
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClientJobsProps {
  clientId: string | undefined;
  onCreateJob: () => void;
}

// Mock client jobs data - in a real app, this would be filtered based on clientId
const mockClientJobs = [
  {
    id: "JOB-101",
    status: "completed",
    date: "2023-05-10",
    service: "HVAC Repair",
    technician: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/150?img=1",
      initials: "JS",
    },
    revenue: 150.00,
  },
  {
    id: "JOB-102",
    status: "in-progress",
    date: "2023-06-11",
    service: "Plumbing",
    technician: {
      name: "Maria Garcia",
      avatar: "https://i.pravatar.cc/150?img=2",
      initials: "MG",
    },
    revenue: 300.00,
  },
  {
    id: "JOB-103",
    status: "scheduled",
    date: "2023-07-12",
    service: "Electrical",
    technician: {
      name: "David Lee",
      avatar: "https://i.pravatar.cc/150?img=3",
      initials: "DL",
    },
    revenue: 450.00,
  },
  {
    id: "JOB-104",
    status: "canceled",
    date: "2023-08-13",
    service: "Maintenance",
    technician: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=4",
      initials: "SJ",
    },
    revenue: 600.00,
  },
];

export const ClientJobs = ({ clientId, onCreateJob }: ClientJobsProps) => {
  const navigate = useNavigate();

  const handleJobClick = (jobId: string) => {
    // Ensuring the navigation is working correctly
    console.log("Navigating to job:", jobId);
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Client Jobs</h2>
          <Button onClick={onCreateJob} className="bg-purple-500 hover:bg-purple-600">
            <Plus size={16} className="mr-2" /> New Job
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-600">Job #</th>
                <th className="text-left p-4 font-medium text-gray-600">Date</th>
                <th className="text-left p-4 font-medium text-gray-600">Service</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600">Technician</th>
                <th className="text-right p-4 font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {mockClientJobs.map((job) => (
                <tr 
                  key={job.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleJobClick(job.id)}
                >
                  <td className="p-4">
                    <span className="text-purple-500 font-medium">{job.id}</span>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2" />
                      {new Date(job.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">{job.service}</td>
                  <td className="p-4">
                    <Badge className={cn(
                      "text-xs font-medium py-1 px-2",
                      job.status === "completed" && "bg-green-100 text-green-600",
                      job.status === "in-progress" && "bg-purple-100 text-purple-600",
                      job.status === "scheduled" && "bg-yellow-100 text-yellow-600",
                      job.status === "canceled" && "bg-gray-100 text-gray-600"
                    )}>
                      {job.status === "completed" && "Completed"}
                      {job.status === "in-progress" && "In Progress"}
                      {job.status === "scheduled" && "Scheduled"}
                      {job.status === "canceled" && "Cancelled"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {job.technician.name}
                  </td>
                  <td className="p-4 text-right font-medium">
                    ${job.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {mockClientJobs.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">This client has no jobs yet.</p>
              <Button onClick={onCreateJob} className="bg-purple-500 hover:bg-purple-600">
                <Plus size={18} className="mr-2" /> Create First Job
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
