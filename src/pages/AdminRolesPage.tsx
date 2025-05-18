
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PERMISSIONS_LIST, UserRole, RolePermissions, DEFAULT_PERMISSIONS, DEFAULT_ROLES } from "@/components/auth/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRBAC, PermissionRequired } from "@/components/auth/RBACProvider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, Plus, UserPlus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const createRoleSchema = z.object({
  roleName: z.string()
    .min(3, "Role name must be at least 3 characters")
    .max(30, "Role name must be less than 30 characters")
    .regex(/^[a-zA-Z0-9 ]+$/, "Only letters, numbers, and spaces are allowed")
    .refine(name => !name.startsWith(' ') && !name.endsWith(' '), {
      message: "Role name cannot start or end with a space"
    }),
  roleDescription: z.string().max(100, "Description must be less than 100 characters").optional(),
});

type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

const AdminRolesPage = () => {
  const { hasPermission, allRoles, addCustomRole } = useRBAC();
  const [activeTab, setActiveTab] = useState<UserRole>("admin");
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  
  // Create a copy of default permissions for editing
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>({
    ...DEFAULT_PERMISSIONS
  });
  
  const createRoleForm = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      roleName: "",
      roleDescription: "",
    },
  });

  const handleCreateRole = (data: CreateRoleFormValues) => {
    addCustomRole(data.roleName);
    setIsCreateRoleOpen(false);
    createRoleForm.reset();
  };
  
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
    
    // Save custom roles permissions to localStorage
    try {
      const customRolesPermissions = Object.entries(rolePermissions)
        .filter(([role]) => !DEFAULT_ROLES.includes(role as UserRole))
        .reduce((acc, [role, permissions]) => {
          acc[role] = permissions;
          return acc;
        }, {} as Record<string, string[]>);
        
      localStorage.setItem('fixlyfy_custom_roles_permissions', JSON.stringify(customRolesPermissions));
    } catch (error) {
      console.error('Error saving custom roles permissions:', error);
    }
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
  
  // Generate TabsTrigger components dynamically from all available roles
  const renderRoleTabs = () => {
    // Filter out any undefined or empty roles
    const safeRoles = Object.keys(rolePermissions).filter(Boolean);
    
    return (
      <TabsList className="grid grid-cols-5 mb-6">
        {safeRoles.map((role) => (
          <TabsTrigger 
            key={role} 
            value={role}
            className="capitalize"
          >
            {role}
          </TabsTrigger>
        ))}
        <TabsTrigger 
          value="create-role"
          onClick={() => setIsCreateRoleOpen(true)}
          className="bg-fixlyfy/10 hover:bg-fixlyfy/20 text-fixlyfy"
        >
          <Plus size={16} className="mr-1" /> Add Role
        </TabsTrigger>
      </TabsList>
    );
  };
  
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
        
        {/* Create Role Dialog */}
        <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus size={18} /> Create New Role
              </DialogTitle>
              <DialogDescription>
                Create a custom role with specific permissions for your organization.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createRoleForm}>
              <form onSubmit={createRoleForm.handleSubmit(handleCreateRole)} className="space-y-4">
                <FormField
                  control={createRoleForm.control}
                  name="roleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role name" {...field} />
                      </FormControl>
                      <FormDescription>
                        This name will be used to identify the role in the system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createRoleForm.control}
                  name="roleDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of this role" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-fixlyfy hover:bg-fixlyfy/90">
                    Create Role
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>
              Configure which actions are allowed for each role in your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserRole)}>
              {renderRoleTabs()}
              
              <TabsContent value={activeTab} className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium capitalize">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Role
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === 'admin' && "Full control over all settings and data."}
                      {activeTab === 'manager' && "Can view team performance and approve estimates and invoices."}
                      {activeTab === 'dispatcher' && "Can assign and schedule jobs for technicians."}
                      {activeTab === 'technician' && "Can manage their own jobs and create related documents."}
                      {!DEFAULT_ROLES.includes(activeTab) && "Custom role with configurable permissions."}
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
                                      (activeTab === 'admin' && rolePermissions[activeTab]?.includes('*')) ||
                                      rolePermissions[activeTab]?.includes(permission.id)
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
