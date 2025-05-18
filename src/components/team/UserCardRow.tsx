
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
    
  return (
    <TableRow>
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
        <RoleDropdown userId={user.id} role={user.role} disabled={!canEditRoles} />
      </TableCell>
      <TableCell>
        <Badge variant={user.status === "active" ? "outline" : "secondary"} className={user.status === "active" ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800" : "bg-gray-100 text-gray-700"}>
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
