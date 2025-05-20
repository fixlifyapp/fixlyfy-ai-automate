
import { TeamMember } from "@/types/team";

export const teamMembers: TeamMember[] = [];

// Function to update team members with generated test data
export const updateTeamMembers = (newMembers: TeamMember[]): TeamMember[] => {
  // In a real app, this would update the database
  // Here, we're just returning the new data for display
  return [...teamMembers, ...newMembers];
};
