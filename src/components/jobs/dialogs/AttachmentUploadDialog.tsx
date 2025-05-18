
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, ChangeEvent } from "react";
import { toast } from "sonner";
import { FileText, X, Upload } from "lucide-react";

interface Attachment {
  id: number;
  name: string;
  size: string;
}

interface AttachmentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAttachments: Attachment[];
  onSave: (attachments: Attachment[]) => void;
}

export function AttachmentUploadDialog({
  open,
  onOpenChange,
  initialAttachments,
  onSave,
}: AttachmentUploadDialogProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file, index) => ({
        id: Math.max(...attachments.map(a => a.id), 0) + index + 1,
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`
      }));
      
      setAttachments(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) added`);
    }
  };

  const handleRemoveAttachment = (id: number) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = () => {
    onSave(attachments);
    onOpenChange(false);
    toast.success("Attachments updated");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Attachments</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} className="mr-2" />
              Choose Files
            </Button>
            <p className="mt-2 text-sm text-gray-500">
              Or drag and drop files here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supported formats: PDF, JPEG, PNG, DOC, DOCX
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="mb-2 block">
              Uploaded Attachments ({attachments.length} files)
            </Label>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.id} 
                  className="flex items-center justify-between p-2 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    <span>{attachment.name}</span>
                    <span className="text-xs text-gray-500">{attachment.size}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              
              {attachments.length === 0 && (
                <p className="text-sm text-gray-500">No files uploaded</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
