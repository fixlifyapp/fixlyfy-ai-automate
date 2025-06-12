import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useJobs } from '@/hooks/useJobsConsolidated';
import { Job } from '@/hooks/useJobsConsolidated';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteJob } from '@/lib/jobs';
import { toast } from 'sonner';
import { SteppedEstimateBuilder } from '@/components/jobs/dialogs/SteppedEstimateBuilder';
import { InvoiceBuilderDialog } from '@/components/jobs/dialogs/InvoiceBuilderDialog';
import { format } from 'date-fns';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useClients } from '@/hooks/useClients';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { generateNextId } from '@/utils/idGeneration';

const JobsPage = () => {
  const navigate = useNavigate();
  const { jobs, isLoading, mutateJobs } = useJobs();
  const { clients, isLoading: isClientsLoading } = useClients();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedClient, setSelectedClient] = useState(searchParams.get('client') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isEstimateDialogOpen, setIsEstimateDialogOpen] = useState(false);
  const [selectedJobIdForEstimate, setSelectedJobIdForEstimate] = useState<string | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedJobIdForInvoice, setSelectedJobIdForInvoice] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // Update search params when search query or client changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);
    if (selectedClient) params.set('client', selectedClient);
    setSearchParams(params);
  }, [debouncedSearchQuery, selectedClient, setSearchParams]);

  // Filter jobs based on search query and selected client
  const filteredJobs = useCallback(() => {
    let filtered = [...jobs];

    if (debouncedSearchQuery) {
      const lowerCaseQuery = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(job => {
        const clientName = typeof job.client === 'string' ? job.client : job.client?.name || 'Unknown Client';
        return (
          job.title?.toLowerCase().includes(lowerCaseQuery) ||
          job.description?.toLowerCase().includes(lowerCaseQuery) ||
          clientName.toLowerCase().includes(lowerCaseQuery)
        );
      });
    }

    if (selectedClient) {
      filtered = filtered.filter(job => job.client_id === selectedClient);
    }

    return filtered;
  }, [jobs, debouncedSearchQuery, selectedClient]);

  const handleDeleteJob = async (jobId: string) => {
    setJobToDelete(jobId);
  };

  const confirmDeleteJob = async () => {
    if (jobToDelete) {
      try {
        await deleteJob(jobToDelete);
        mutateJobs();
        toast.success('Job deleted successfully');
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Failed to delete job');
      } finally {
        setJobToDelete(null);
      }
    }
  };

  const cancelDeleteJob = () => {
    setJobToDelete(null);
  };

  const handleCreateEstimate = (jobId: string) => {
    setSelectedJobIdForEstimate(jobId);
    setIsEstimateDialogOpen(true);
  };

  const handleCreateInvoice = (jobId: string) => {
    setSelectedJobIdForInvoice(jobId);
    setIsInvoiceDialogOpen(true);
  };

  const handleEstimateCreated = () => {
    setIsEstimateDialogOpen(false);
    setSelectedJobIdForEstimate(null);
  };

  const handleInvoiceCreated = () => {
    setIsInvoiceDialogOpen(false);
    setSelectedJobIdForInvoice(null);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Jobs</h1>
        <Button onClick={() => navigate('/jobs/new')}><Plus className="mr-2 h-4 w-4" /> Add Job</Button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
              }}
              className="absolute right-2.5 top-0 h-full rounded-none px-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
        </div>

        <div>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Clients</SelectItem>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading || isClientsLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-3">Title</TableHead>
                <TableHead className="px-6 py-3">Client</TableHead>
                <TableHead className="px-6 py-3">Status</TableHead>
                <TableHead className="px-6 py-3">Date</TableHead>
                <TableHead className="px-6 py-3">Created At</TableHead>
                <TableHead className="px-6 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs().map((job: Job) => (
                <TableRow key={job.id} className="hover:bg-gray-100">
                  <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {job.title || 'No Title'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {typeof job.client === 'string' ? job.client : job.client?.name || 'Unknown Client'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">{job.status}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">{formatDate(job.date)}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">{formatDate(job.created_at)}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/jobs/edit/${job.id}`)}>
                          Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateEstimate(job.id)}>
                          Create Estimate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateInvoice(job.id)}>
                          Create Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteJob(job.id)} className="text-red-500">
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => { if (!open) cancelDeleteJob(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this job?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteJob}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteJob}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SteppedEstimateBuilder
        open={isEstimateDialogOpen}
        onOpenChange={setIsEstimateDialogOpen}
        jobId={selectedJobIdForEstimate || ''}
        onEstimateCreated={handleEstimateCreated}
      />

      <InvoiceBuilderDialog
        open={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        jobId={selectedJobIdForInvoice || ''}
        onInvoiceCreated={handleInvoiceCreated}
      />
    </div>
  );
};

export default JobsPage;
