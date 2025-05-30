
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, Settings, Eye } from 'lucide-react';

export const TeamRoleManager: React.FC = () => {
  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full access to all features and settings',
      permissions: ['All Permissions'],
      userCount: 2,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Manage team and view all data',
      permissions: ['Team Management', 'View All Jobs', 'Reports'],
      userCount: 3,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'technician',
      name: 'Technician',
      description: 'View and update assigned jobs',
      permissions: ['View Assigned Jobs', 'Update Job Status', 'Add Notes'],
      userCount: 8,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'dispatcher',
      name: 'Dispatcher',
      description: 'Schedule and assign jobs',
      permissions: ['Schedule Jobs', 'Assign Technicians', 'View Reports'],
      userCount: 1,
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Management
        </CardTitle>
        <CardDescription>
          Define and manage user roles and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{role.name}</h4>
                  <Badge className={role.color}>
                    {role.userCount} users
                  </Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {role.description}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          
          <Button variant="outline" className="w-full">
            Create Custom Role
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
