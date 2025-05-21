
import { useState, useEffect } from 'react';
import { TeamMemberProfile } from "@/types/team-member";
import { teamMembers as initialTeamMembers } from "@/data/team";

// Mock expanded profile data (in a real app this would come from the API)
const expandedTeamMembers: Record<string, TeamMemberProfile> = {
  "1": {
    id: "1",
    name: "John Smith",
    email: "john.smith@fixlyfy.com",
    role: "admin",
    status: "active",
    avatar: "https://github.com/shadcn.png",
    lastLogin: new Date("2025-05-17T10:30:00").toISOString(),
    isPublic: true,
    availableForJobs: true,
    phone: ["555-123-4567"],
    address: "123 Main St, San Francisco, CA",
    twoFactorEnabled: true,
    callMaskingEnabled: false,
    laborCostPerHour: 75,
    skills: [
      { id: "1", name: "Plumbing" },
      { id: "2", name: "Electrical" }
    ],
    serviceAreas: [
      { id: "1", name: "San Francisco", zipCode: "94103" },
      { id: "2", name: "Oakland", zipCode: "94612" }
    ],
    scheduleColor: "#4f46e5",
    internalNotes: "Senior technician with 10+ years experience.",
    usesTwoFactor: true
  },
  "2": {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@fixlyfy.com",
    role: "manager",
    status: "active",
    avatar: "https://github.com/shadcn.png",
    lastLogin: new Date("2025-05-16T14:22:00").toISOString(),
    isPublic: true,
    availableForJobs: false,
    phone: ["555-987-6543"],
    address: "456 Market St, San Francisco, CA",
    twoFactorEnabled: false,
    callMaskingEnabled: true,
    laborCostPerHour: 85,
    skills: [
      { id: "3", name: "HVAC" },
      { id: "4", name: "Customer Management" }
    ],
    serviceAreas: [
      { id: "1", name: "San Francisco", zipCode: "94103" },
      { id: "3", name: "San Jose", zipCode: "95113" }
    ],
    scheduleColor: "#8b5cf6",
    internalNotes: "Great with customer escalations.",
    usesTwoFactor: false
  }
};

export const useTeamMemberData = (id: string | undefined) => {
  const [member, setMember] = useState<TeamMemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // In a real app, this would be an API call
      const basicMember = initialTeamMembers.find(m => m.id === id);
      if (basicMember) {
        const expandedMember = expandedTeamMembers[id] || {
          ...basicMember,
          isPublic: true,
          availableForJobs: true,
          phone: [],
          twoFactorEnabled: false,
          callMaskingEnabled: false,
          laborCostPerHour: 50,
          skills: [],
          serviceAreas: [],
          scheduleColor: "#6366f1",
          usesTwoFactor: false
        };
        setMember(expandedMember);
      }
    }
    setIsLoading(false);
  }, [id]);

  return { member, isLoading };
};
