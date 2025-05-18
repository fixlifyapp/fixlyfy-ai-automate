
import { TeamMember } from "@/types/team";

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@fixlyfy.com",
    role: "admin",
    status: "active",
    avatar: "https://github.com/shadcn.png",
    lastLogin: new Date("2025-05-17T10:30:00").toISOString(),
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@fixlyfy.com",
    role: "manager",
    status: "active",
    avatar: "https://github.com/shadcn.png",
    lastLogin: new Date("2025-05-16T14:22:00").toISOString(),
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "michael.chen@fixlyfy.com",
    role: "technician",
    status: "active",
    avatar: "https://github.com/shadcn.png",
    lastLogin: new Date("2025-05-18T07:15:00").toISOString(),
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@fixlyfy.com",
    role: "dispatcher",
    status: "active",
    avatar: "https://github.com/shadcn.png",
    lastLogin: new Date("2025-05-17T16:45:00").toISOString(),
  },
  {
    id: "5",
    name: "David Kim",
    email: "david.kim@fixlyfy.com",
    role: "technician",
    status: "suspended",
    avatar: "https://github.com/shadcn.png",
    lastLogin: new Date("2025-05-10T09:30:00").toISOString(),
  }
];
