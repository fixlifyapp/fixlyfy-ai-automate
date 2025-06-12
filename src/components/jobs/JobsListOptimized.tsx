import { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Job } from "@/hooks/useJobs";

interface JobsListOptimizedProps {
  jobs: Job[];
  isGridView?: boolean;
  selectedJobs?: string[];
  onSelectJob?: (jobId: string, isSelected: boolean) => void;
  onSelectAllJobs?: (isSelected: boolean) => void;
  showClientColumn?: boolean;
  onRefresh?: () => void;
}

export const JobsListOptimized = ({ 
  jobs, 
  isGridView = true, 
  selectedJobs = [], 
  onSelectJob, 
  onSelectAllJobs,
  showClientColumn = true,
  onRefresh 
}: JobsListOptimizedProps) => {
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  const handleJobClick = useCallback((jobId: string) => {
    navigate(`/jobs/${jobId}`);
  }, [navigate]);

  const handleCheckboxChange = useCallback((jobId: string, checked: boolean) => {
    onSelectJob?.(jobId, checked);
  }, [onSelectJob]);

  const handleSelectAllChange = useCallback((checked: boolean) => {
    setSelectAll(checked);
    onSelectAllJobs?.(checked);
  }, [onSelectAllJobs]);

  const getClientName = (client: any): string => {
    if (typeof client === 'string') return client;
    if (typeof client === 'object' && client?.name) return client.name;
    return 'Unknown Client';
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs.map((job) => {
        const isSelected = selectedJobs.includes(job.id);
        const clientName = getClientName(job.client);
        
        return (
          <Card 
            key={job.id} 
            className={`relative transition-all duration-200 hover:shadow-md cursor-pointer group ${
              isSelected ? 'ring-2 ring-primary shadow-lg' : ''
            }`}
            onClick={() => handleJobClick(job.id)}
          >
            {isSelected && (
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => handleCheckboxChange(job.id, checked)}
                />
              </div>
            )}
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>
                {clientName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                Status: {job.status}
              </div>
              {job.revenue && (
                <div className="flex items-center text-sm text-muted-foreground">
                  Revenue: {formatCurrency(job.revenue)}
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Updated: {new Date(job.updated_at).toLocaleDateString()}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedJobs.length === jobs.length}
                onCheckedChange={handleSelectAllChange}
              />
            </TableHead>
            <TableHead>Title</TableHead>
            {showClientColumn && <TableHead>Client</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const isSelected = selectedJobs.includes(job.id);
            const clientName = getClientName(job.client);
            
            return (
              <TableRow 
                key={job.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  isSelected ? 'bg-muted' : ''
                }`}
                onClick={() => handleJobClick(job.id)}
              >
                <TableCell className="font-medium w-[50px]">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleCheckboxChange(job.id, checked)}
                  />
                </TableCell>
                <TableCell>{job.title}</TableCell>
                {showClientColumn && <TableCell>{clientName}</TableCell>}
                <TableCell>{job.status}</TableCell>
                <TableCell>{job.date}</TableCell>
                <TableCell className="text-right">{formatCurrency(job.revenue || 0)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return isGridView ? renderGridView() : renderTableView();
};
