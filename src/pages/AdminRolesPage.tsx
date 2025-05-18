
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PERMISSIONS_LIST, UserRole, RolePermissions, DEFAULT_PERMISSIONS } from "@/components/auth/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRBAC, PermissionRequired } from "@/components/auth/RBACProvider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const AdminRolesPage = () => {
  const { hasPermission } = useRBAC();
  const [activeTab, setActiveTab] = useState<UserRole>("admin");
  
  // Create a copy of default permissions for editing
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>({
    ...DEFAULT_PERMISSIONS
  });
  
  const handlePermissionToggle = (role: UserRole, permissionId: string) => {
    setRolePermissions(prev => {
      const updatedPermissions = { ...prev };
      
      // For admin role, don't allow removing wildcard permission
      if (role === 'admin' && permissionId === '*') {
        return prev;
      }
      
      // If permission exists, remove it, otherwise add it
      if (updatedPermissions[role].includes(permissionId)) {
        updatedPermissions[role] = updatedPermissions[role].filter(id => id !== permissionId);
      } else {
        updatedPermissions[role] = [...updatedPermissions[role], permissionId];
      }
      
      return updatedPermissions;
    });
  };
  
  const handleSave = () => {
    // In a real app, this would make an API call to save the permissions
    toast.success("Role permissions updated successfully");
    console.log("Updated permissions:", rolePermissions);
  };
  
  const handleReset = () => {
    setRolePermissions({ ...DEFAULT_PERMISSIONS });
    toast("Permissions reset to defaults");
  };
  
  // Group permissions by category
  const permissionsByCategory = PERMISSIONS_LIST.reduce<Record<string, typeof PERMISSIONS_LIST>>(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {}
  );
  
  // UI to render for users without access
  const unauthorizedContent = (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        You don't have permission to view this page. Please contact your administrator for access.
      </p>
      <Button onClick={() => window.history.back()}>Go Back</Button>
    </div>
  );

  return (
    <PageLayout>
      <PermissionRequired permission="users.roles.assign" fallback={unauthorizedContent}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Role-Based Access Control</h1>
          <p className="text-fixlyfy-text-secondary">
            Manage permissions and access rights for different user roles.
          </p>
        </div>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>
              Configure which actions are allowed for each role in your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserRole)}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="manager">Manager</TabsTrigger>
                <TabsTrigger value="dispatcher">Dispatcher</TabsTrigger>
                <TabsTrigger value="technician">Technician</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Role
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === 'admin' && "Full control over all settings and data."}
                      {activeTab === 'manager' && "Can view team performance and approve estimates and invoices."}
                      {activeTab === 'dispatcher' && "Can assign and schedule jobs for technicians."}
                      {activeTab === 'technician' && "Can manage their own jobs and create related documents."}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset}>
                      Reset to Default
                    </Button>
                    <Button className="bg-fixlyfy hover:bg-fixlyfy/90" onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-6 pr-4">
                    {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                      <div key={category} className="space-y-3">
                        <div>
                          <h4 className="text-md font-medium capitalize">{category}</h4>
                          <Separator className="my-2" />
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[350px]">Permission</TableHead>
                              <TableHead>Enabled</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {permissions.map((permission) => (
                              <TableRow key={permission.id}>
                                <TableCell className="font-medium">{permission.name}</TableCell>
                                <TableCell>
                                  <Checkbox 
                                    checked={
                                      // Special case for admin role with wildcard
                                      (activeTab === 'admin' && rolePermissions[activeTab].includes('*')) ||
                                      rolePermissions[activeTab].includes(permission.id)
                                    }
                                    disabled={activeTab === 'admin' && permission.id === '*'}
                                    onCheckedChange={() => handlePermissionToggle(activeTab, permission.id)}
                                    id={`${activeTab}-${permission.id}`}
                                  />
                                </TableCell>
                                <TableCell className="text-muted-foreground flex items-center gap-2">
                                  {permission.description}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle size={16} className="text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="w-[200px] text-sm">{permission.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </PermissionRequired>
    </PageLayout>
  );
};

export default AdminRolesPage;
