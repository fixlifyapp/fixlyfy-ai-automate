
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobsCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JobsCreateModal = ({ open, onOpenChange }: JobsCreateModalProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [items, setItems] = useState<{ name: string; quantity: number; price: number }[]>([
    { name: "", quantity: 1, price: 0 }
  ]);

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleItemChange = (index: number, field: keyof typeof items[0], value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new service job.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="michael">Michael Johnson</SelectItem>
                  <SelectItem value="sarah">Sarah Williams</SelectItem>
                  <SelectItem value="david">David Brown</SelectItem>
                  <SelectItem value="jessica">Jessica Miller</SelectItem>
                  <SelectItem value="new">+ Create New Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Service Area</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="north">North District</SelectItem>
                  <SelectItem value="south">South District</SelectItem>
                  <SelectItem value="east">East District</SelectItem>
                  <SelectItem value="west">West District</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hvac">HVAC Repair</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Input type="time" defaultValue="09:00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="technician">Technician</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Assign technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="robert">Robert Smith</SelectItem>
                  <SelectItem value="john">John Doe</SelectItem>
                  <SelectItem value="emily">Emily Clark</SelectItem>
                  <SelectItem value="ai">AI Auto-assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the job details, customer requirements, etc." 
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Items & Parts</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddItem}
                className="text-fixlyfy border-fixlyfy/20"
              >
                <Plus size={14} className="mr-1" /> Add Item
              </Button>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="flex gap-3">
                <Input 
                  placeholder="Item name" 
                  className="flex-grow" 
                  value={item.name}
                  onChange={(e) => handleItemChange(index, "name", e.target.value)}
                />
                <Input 
                  type="number" 
                  placeholder="Qty" 
                  className="w-20" 
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                />
                <Input 
                  type="number" 
                  placeholder="Price" 
                  className="w-24" 
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value))}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length === 1}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-fixlyfy hover:bg-fixlyfy/90" 
            onClick={() => onOpenChange(false)}
          >
            Create Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
