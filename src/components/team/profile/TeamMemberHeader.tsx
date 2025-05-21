
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, UserCog } from "lucide-react";
import { TeamMemberProfile } from "@/types/team-member";

interface TeamMemberHeaderProps {
  member: TeamMemberProfile;
  isEditing: boolean;
  canEdit: boolean;
  onGoBack: () => void;
  onEdit: () => void;
  onSave: () => void;
}

export const TeamMemberHeader = ({
  member,
  isEditing,
  canEdit,
  onGoBack,
  onEdit,
  onSave,
}: TeamMemberHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onGoBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {member.name}
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium 
                ${
                  member.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : member.role === "manager"
                    ? "bg-indigo-100 text-indigo-800"
                    : member.role === "technician"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
            >
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </span>
          </h1>
          <p className="text-muted-foreground">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {canEdit &&
          (isEditing ? (
            <Button onClick={onSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={onEdit} className="gap-2">
              <UserCog className="h-4 w-4" />
              Edit Profile
            </Button>
          ))}
      </div>
    </div>
  );
};
