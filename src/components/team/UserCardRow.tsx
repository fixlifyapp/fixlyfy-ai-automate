
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { TeamMember } from "@/types/team";
import { RoleDropdown } from "./RoleDropdown";
import { TeamActionMenu } from "./TeamActionMenu";
import { useRBAC } from "@/components/auth/RBACProvider";

interface UserCardRowProps {
  user: TeamMember;
}

export const UserCardRow = ({ user }: UserCardRowProps) => {
  const { hasPermission } = useRBAC();
  const canEditRoles = hasPermission("users.roles.assign");

  // Format the last login date
  const lastLoginFormatted = user.lastLogin
    ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
    : "Never";
    
  // Define role colors for badges
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "manager":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "technician":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200";
      case "dispatcher":
        return "bg-orange-100 text-orange-700 hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
    
  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{user.name}</span>
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {canEditRoles ? (
          <RoleDropdown userId={user.id} role={user.role} disabled={!canEditRoles} />
        ) : (
          <Badge variant="outline" className={`${getRoleBadgeClass(user.role)}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Badge 
          variant={user.status === "active" ? "outline" : "secondary"}
          className={user.status === "active" 
            ? "bg-green-50 text-green-700 hover:bg-green-100" 
            : "bg-gray-100 text-gray-700"
          }
        >
          {user.status === "active" ? "Active" : "Suspended"}
        </Badge>
      </TableCell>
      <TableCell>{lastLoginFormatted}</TableCell>
      <TableCell className="text-right">
        <TeamActionMenu userId={user.id} status={user.status} />
      </TableCell>
    </TableRow>
  );
};
