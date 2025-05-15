
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data for activity feed
const activities = [
  {
    id: 1,
    user: {
      name: "Tom Cook",
      avatar: "https://github.com/shadcn.png"
    },
    action: "created a new job",
    target: "HVAC Repair for Sarah Williams",
    time: "Just now",
    type: "job"
  },
  {
    id: 2,
    user: {
      name: "David Chen",
      avatar: "/avatars/david.jpg"
    },
    action: "completed a job",
    target: "Plumbing Installation for Michael Johnson",
    time: "2 hours ago",
    type: "job"
  },
  {
    id: 3,
    user: {
      name: "Lisa Williams",
      avatar: "/avatars/lisa.jpg"
    },
    action: "added a new client",
    target: "Highland Property Management",
    time: "5 hours ago",
    type: "client"
  },
  {
    id: 4,
    user: {
      name: "Tom Cook",
      avatar: "https://github.com/shadcn.png"
    },
    action: "sent an invoice",
    target: "#INV-1089 to Apex Construction Inc.",
    time: "Yesterday at 2:30 PM",
    type: "invoice"
  },
  {
    id: 5,
    user: {
      name: "Sarah Johnson",
      avatar: "/avatars/sarah.jpg"
    },
    action: "rescheduled a job",
    target: "Electrical Wiring for Jessica Miller",
    time: "Yesterday at 10:15 AM",
    type: "job"
  }
];

export const ActivityFeed = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Recent actions by you and your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>
                  {" "}
                  {activity.action}
                  {" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-fixlyfy-text-secondary">{activity.time}</p>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "ml-auto",
                  activity.type === "job" && "border-fixlyfy text-fixlyfy",
                  activity.type === "client" && "border-fixlyfy-success text-fixlyfy-success",
                  activity.type === "invoice" && "border-fixlyfy-warning text-fixlyfy-warning"
                )}
              >
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
