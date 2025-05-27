
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Shield, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export const TeamManagementSettings = () => {
  const teamSections = [
    {
      title: "Team Members",
      description: "Manage your team and their permissions",
      icon: Users,
      href: "/admin/team#members"
    },
    {
      title: "Invitations",
      description: "Send and manage team invitations",
      icon: UserPlus,
      href: "/admin/team#invitations"
    },
    {
      title: "Roles & Permissions",
      description: "Configure user roles and access levels",
      icon: Shield,
      href: "/admin/team#roles"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Team Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage your team members, roles, and permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamSections.map((section) => (
          <Link key={section.title} to={section.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6 space-x-4">
                <div className="bg-fixlyfy/10 p-3 rounded-full">
                  <section.icon className="h-6 w-6 text-fixlyfy" />
                </div>
                <div>
                  <h4 className="font-medium">{section.title}</h4>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/team" className="text-fixlyfy hover:underline text-sm">
              Go to Team Management →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
