
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Users, Edit, Eye, Trash2, Plus } from "lucide-react";
import { PERMISSIONS_LIST, DEFAULT_PERMISSIONS } from "@/components/auth/types";

export const RolesPermissionsTab = () => {
  const [selectedRole, setSelectedRole] = useState<string>("admin");

  const roles = [
    { id: "admin", name: "Admin", color: "bg-red-100 text-red-800", members: 2 },
    { id: "manager", name: "Manager", color: "bg-blue-100 text-blue-800", members: 3 },
    { id: "dispatcher", name: "Dispatcher", color: "bg-green-100 text-green-800", members: 2 },
    { id: "technician", name: "Technician", color: "bg-gray-100 text-gray-800", members: 8 }
  ];

  const permissionCategories = [
    { id: "jobs", name: "Jobs Management" },
    { id: "clients", name: "Client Management" },
    { id: "estimates", name: "Estimates" },
    { id: "invoices", name: "Invoices" },
    { id: "users", name: "User Management" },
    { id: "reports", name: "Reports" },
    { id: "schedule", name: "Scheduling" },
    { id: "finance", name: "Finance" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Roles & Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Configure user roles and their permissions across the application.
        </p>
      </div>

      {/* Roles Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRole === role.id ? 'border-fixlyfy bg-fixlyfy/5' : 'border-gray-200'
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={role.color}>{role.name}</Badge>
                  <span className="text-sm text-muted-foreground">{role.members} members</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {role.id === 'admin' && 'Full system access and control'}
                  {role.id === 'manager' && 'Manage teams, jobs, and reports'}
                  {role.id === 'dispatcher' && 'Schedule jobs and coordinate teams'}
                  {role.id === 'technician' && 'View assigned jobs and update status'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions for Selected Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Permissions for {roles.find(r => r.id === selectedRole)?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {permissionCategories.map((category) => {
              const categoryPermissions = PERMISSIONS_LIST.filter(p => p.category === category.id);
              const rolePermissions = DEFAULT_PERMISSIONS[selectedRole as keyof typeof DEFAULT_PERMISSIONS] || [];
              
              return (
                <div key={category.id} className="space-y-3">
                  <h4 className="font-medium text-sm">{category.name}</h4>
                  <div className="grid grid-cols-1 gap-2 pl-4">
                    {categoryPermissions.map((permission) => {
                      const hasPermission = rolePermissions.includes('*') || 
                                          rolePermissions.includes(permission.id) ||
                                          rolePermissions.some(rp => permission.id.startsWith(rp.replace('.all', '')));
                      
                      return (
                        <div key={permission.id} className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <Label className="text-sm">{permission.name}</Label>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                          <Switch 
                            checked={hasPermission}
                            disabled={selectedRole === 'admin'}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Role
            </Button>
            <Button variant="outline" size="sm" disabled={selectedRole === 'admin'}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Role
            </Button>
            <Button variant="outline" size="sm" disabled={selectedRole === 'admin'}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Role
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
