
import { useState } from "react";
import { TeamMemberProfile } from "@/types/team-member";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Copy, Save, Plus } from "lucide-react";

interface AdvancedTabProps {
  member: TeamMemberProfile;
  isEditing: boolean;
}

// Mock permissions data
const mockPermissions = [
  // Jobs Module
  { id: "jobs-view", name: "View Jobs", module: "jobs", type: "view", enabled: true },
  { id: "jobs-edit", name: "Edit Jobs", module: "jobs", type: "edit", enabled: true },
  { id: "jobs-create", name: "Create Jobs", module: "jobs", type: "create", enabled: true },
  { id: "jobs-delete", name: "Delete Jobs", module: "jobs", type: "delete", enabled: false },
  
  // Clients Module
  { id: "clients-view", name: "View Clients", module: "clients", type: "view", enabled: true },
  { id: "clients-edit", name: "Edit Clients", module: "clients", type: "edit", enabled: true },
  { id: "clients-create", name: "Create Clients", module: "clients", type: "create", enabled: true },
  { id: "clients-delete", name: "Delete Clients", module: "clients", type: "delete", enabled: false },
  
  // Estimates/Invoices Module
  { id: "estimates-view", name: "View Estimates", module: "estimates", type: "view", enabled: true },
  { id: "estimates-edit", name: "Edit Estimates", module: "estimates", type: "edit", enabled: true },
  { id: "estimates-create", name: "Create Estimates", module: "estimates", type: "create", enabled: true },
  { id: "estimates-delete", name: "Delete Estimates", module: "estimates", type: "delete", enabled: false },
  { id: "invoices-view", name: "View Invoices", module: "invoices", type: "view", enabled: true },
  { id: "invoices-edit", name: "Edit Invoices", module: "invoices", type: "edit", enabled: true },
  { id: "invoices-create", name: "Create Invoices", module: "invoices", type: "create", enabled: true },
  { id: "invoices-delete", name: "Delete Invoices", module: "invoices", type: "delete", enabled: false },
  
  // Reports Module
  { id: "reports-view", name: "View Reports", module: "reports", type: "view", enabled: true },
  { id: "reports-create", name: "Create Reports", module: "reports", type: "create", enabled: false },
  
  // Finance Module
  { id: "finance-view", name: "View Finance", module: "finance", type: "view", enabled: false },
  { id: "finance-edit", name: "Edit Finance", module: "finance", type: "edit", enabled: false },
  
  // Schedule Module
  { id: "schedule-view", name: "View Schedule", module: "schedule", type: "view", enabled: true },
  { id: "schedule-edit", name: "Edit Schedule", module: "schedule", type: "edit", enabled: true },
  
  // Automation Module
  { id: "automation-view", name: "View Automations", module: "automation", type: "view", enabled: false },
  { id: "automation-edit", name: "Edit Automations", module: "automation", type: "edit", enabled: false },
  { id: "automation-create", name: "Create Automations", module: "automation", type: "create", enabled: false },
];

export const AdvancedTab = ({ member, isEditing }: AdvancedTabProps) => {
  const [permissions, setPermissions] = useState(mockPermissions);
  const [roleName, setRoleName] = useState(member.role);
  
  const handlePermissionChange = (id: string, checked: boolean) => {
    if (!isEditing) return;
    
    setPermissions(permissions.map(permission => 
      permission.id === id ? { ...permission, enabled: checked } : permission
    ));
  };
  
  const modules = [...new Set(permissions.map(p => p.module))];
  
  const handleDuplicateRole = () => {
    // This would create a duplicate role in a real application
    console.log("Duplicating role:", member.role);
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6 border-fixlyfy-border shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-medium">Role Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Configure role permissions and access levels
            </p>
          </div>
          
          {isEditing && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDuplicateRole}
                className="gap-1"
              >
                <Copy className="h-4 w-4" />
                Duplicate Role
              </Button>
              
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                New Role
              </Button>
            </div>
          )}
        </div>
        
        {/* Custom Role Name */}
        {isEditing && (
          <div className="mb-6">
            <Label htmlFor="roleName">Role Name</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="max-w-xs"
              />
              <Button size="sm" className="gap-1">
                <Save className="h-4 w-4" />
                Save Role
              </Button>
            </div>
          </div>
        )}
        
        {/* Permissions */}
        <div className="space-y-6">
          <h4 className="text-base font-medium">Permissions by Module</h4>
          
          {modules.map(module => (
            <div key={module} className="space-y-3">
              <div>
                <Badge className="capitalize">
                  {module}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {permissions
                  .filter(p => p.module === module)
                  .map(permission => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{permission.name}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">
                                {getPermissionDescription(permission.module, permission.type)}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id={permission.id}
                        checked={permission.enabled}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                        disabled={!isEditing}
                      />
                    </div>
                  ))}
              </div>
              
              <Separator className="my-4" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Helper function to generate descriptions for permissions
function getPermissionDescription(module: string, type: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    jobs: {
      view: "Allows viewing job details, history, and status.",
      edit: "Allows modifying job information, status, and assignments.",
      create: "Allows creating new jobs in the system.",
      delete: "Allows removing jobs from the system."
    },
    clients: {
      view: "Allows viewing client information and history.",
      edit: "Allows updating client contact details and preferences.",
      create: "Allows adding new clients to the system.",
      delete: "Allows removing clients from the system."
    },
    estimates: {
      view: "Allows viewing estimates and their status.",
      edit: "Allows modifying estimates before client approval.",
      create: "Allows creating new estimates for jobs.",
      delete: "Allows removing estimates from the system."
    },
    invoices: {
      view: "Allows viewing invoices and payment status.",
      edit: "Allows modifying invoices before finalization.",
      create: "Allows creating new invoices from estimates or directly.",
      delete: "Allows voiding or removing invoices."
    },
    reports: {
      view: "Allows access to standard reports.",
      create: "Allows creating custom reports."
    },
    finance: {
      view: "Allows viewing financial information and reports.",
      edit: "Allows modifying payment records and financial settings."
    },
    schedule: {
      view: "Allows viewing team schedules and availability.",
      edit: "Allows modifying scheduling and dispatching."
    },
    automation: {
      view: "Allows viewing automation rules and history.",
      edit: "Allows modifying existing automation rules.",
      create: "Allows creating new automation workflows."
    }
  };
  
  return descriptions[module]?.[type] || "Controls access to this functionality.";
}
