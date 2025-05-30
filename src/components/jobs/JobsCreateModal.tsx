
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJobs } from '@/hooks/useJobs';
import { useClients } from '@/hooks/useClients';
import { toast } from 'sonner';

interface JobsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const JobsCreateModal: React.FC<JobsCreateModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [jobType, setJobType] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [isLoading, setIsLoading] = useState(false);

  const { addJob } = useJobs();
  const { clients } = useClients();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Job title is required');
      return;
    }

    setIsLoading(true);
    try {
      await addJob({
        title,
        description,
        client_id: clientId || undefined,
        job_type: jobType || undefined,
        status
      });
      
      toast.success('Job created successfully');
      setTitle('');
      setDescription('');
      setClientId('');
      setJobType('');
      setStatus('scheduled');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Create a new service job for your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter job title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter job description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="jobType">Job Type</Label>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
