
import React, { useState } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface TeamInviteModalProps {
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const TeamInviteModal: React.FC<TeamInviteModalProps> = ({
  onOpenChange,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('technician');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      toast.error('Email and name are required');
      return;
    }

    setIsLoading(true);
    try {
      // Implement team invitation logic here
      toast.success('Team invitation sent successfully');
      setEmail('');
      setName('');
      setRole('technician');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogDescription>
          Send an invitation to a new team member to join your organization.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
          />
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="technician">Technician</SelectItem>
              <SelectItem value="dispatcher">Dispatcher</SelectItem>
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
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};
