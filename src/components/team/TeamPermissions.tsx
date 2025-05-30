
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Eye, Edit, Trash2, Users, FileText, DollarSign } from 'lucide-react';

export const TeamPermissions: React.FC = () => {
  const permissionGroups = [
    {
      name: 'Jobs Management',
      icon: FileText,
      permissions: [
        { name: 'View All Jobs', level: 'read' },
        { name: 'View Assigned Jobs', level: 'read' },
        { name: 'Create Jobs', level: 'write' },
        { name: 'Edit Jobs', level: 'write' },
        { name: 'Delete Jobs', level: 'delete' }
      ]
    },
    {
      name: 'Team Management',
      icon: Users,
      permissions: [
        { name: 'View Team', level: 'read' },
        { name: 'Invite Members', level: 'write' },
        { name: 'Edit Members', level: 'write' },
        { name: 'Remove Members', level: 'delete' }
      ]
    },
    {
      name: 'Financial',
      icon: DollarSign,
      permissions: [
        { name: 'View Invoices', level: 'read' },
        { name: 'Create Invoices', level: 'write' },
        { name: 'Process Payments', level: 'write' },
        { name: 'View Reports', level: 'read' }
      ]
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'read': return 'bg-green-100 text-green-800';
      case 'write': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'read': return <Eye className="h-3 w-3" />;
      case 'write': return <Edit className="h-3 w-3" />;
      case 'delete': return <Trash2 className="h-3 w-3" />;
      default: return <Lock className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Permissions Overview
        </CardTitle>
        <CardDescription>
          View all available permissions organized by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {permissionGroups.map((group) => (
            <div key={group.name}>
              <div className="flex items-center gap-2 mb-3">
                <group.icon className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">{group.name}</h4>
              </div>
              
              <div className="space-y-2 ml-6">
                {group.permissions.map((permission) => (
                  <div key={permission.name} className="flex items-center justify-between">
                    <span className="text-sm">{permission.name}</span>
                    <Badge className={`${getLevelColor(permission.level)} flex items-center gap-1`}>
                      {getLevelIcon(permission.level)}
                      {permission.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
