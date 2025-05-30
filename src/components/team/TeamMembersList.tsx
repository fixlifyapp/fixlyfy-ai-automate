
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  last_login?: string;
  phone?: string;
  created_at: string;
}

interface TeamMembersListProps {
  members: TeamMember[];
  isLoading: boolean;
  canEdit: boolean;
  onEdit: (memberId: string) => void;
  onDelete: (memberId: string) => void;
  onView: (memberId: string) => void;
  onRefresh: () => void;
}

export const TeamMembersList: React.FC<TeamMembersListProps> = ({
  members,
  isLoading,
  canEdit,
  onEdit,
  onDelete,
  onView,
  onRefresh
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          Manage your team members and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  {member.phone && (
                    <p className="text-xs text-muted-foreground">{member.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                  {member.role}
                </Badge>
                <Badge 
                  variant={
                    member.status === 'active' ? 'success' : 
                    member.status === 'pending' ? 'warning' : 'secondary'
                  }
                >
                  {member.status}
                </Badge>
                
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(member.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(member.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(member.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
          
          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No team members found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
