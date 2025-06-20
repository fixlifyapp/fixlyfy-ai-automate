
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClients, Client } from "@/hooks/useClients";
import { toast } from "sonner";

interface ClientsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (client: Client) => void;
}

export const ClientsCreateModal = ({ open, onOpenChange, onSuccess }: ClientsCreateModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addClient } = useClients();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const name = formData.get('name') as string;
      const phone = formData.get('phone') as string;
      
      // Ensure we have the required name field
      if (!name || name.trim() === '') {
        toast.error("Client name is required");
        setIsSubmitting(false);
        return;
      }
      
      // Ensure we have phone number for messaging
      if (!phone || phone.trim() === '') {
        toast.error("Phone number is required for messaging and communication");
        setIsSubmitting(false);
        return;
      }
      
      // Create client data with required name and phone fields and optional fields
      const clientData = {
        name,
        phone,
        email: formData.get('email') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zip: formData.get('zip') as string,
        country: formData.get('country') as string,
        type: formData.get('clientType') as string,
        status: formData.get('status') as string,
        notes: formData.get('notes') as string,
      };
      
      const newClient = await addClient(clientData);
      
      onOpenChange(false);
      toast.success("Client added successfully");
      
      // Call the onSuccess callback if provided
      if (onSuccess && newClient) {
        onSuccess(newClient);
      }
      
      // Reset form
      (e.target as HTMLFormElement).reset();
      
      // Force a small delay to ensure database transaction is complete
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('clientsRefresh'));
      }, 100);
      
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Failed to add client");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new client to your database. Phone number is required for messaging and communication.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-grow px-6" style={{ maxHeight: "calc(80vh - 170px)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="clientType">Client Type *</Label>
                <Select name="clientType" defaultValue="residential" required>
                  <SelectTrigger id="clientType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="property-manager">Property Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select name="status" defaultValue="active" required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" placeholder="Full name or business name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="Email address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" placeholder="Phone number (required for messaging)" required />
                <p className="text-xs text-muted-foreground">Required for SMS messaging and communication</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="altPhone">Alternative Phone</Label>
                <Input id="altPhone" name="altPhone" placeholder="Alternative phone (optional)" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input id="address" name="address" placeholder="Street address" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" name="city" placeholder="City" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input id="state" name="state" placeholder="State/Province" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP / Postal Code *</Label>
                <Input id="zip" name="zip" placeholder="ZIP / Postal code" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input id="country" name="country" placeholder="Country" defaultValue="United States" required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes"
                  placeholder="Add any additional notes about this client"
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
