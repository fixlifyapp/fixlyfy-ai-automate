import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/team";

interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  state: string;
  type: string;
  rating: number;
  status: string;
  notes?: string;
}

interface Job {
  id: string;
  client_id: string;
  title: string;
  description: string;
  status: string;
  date: string;
  schedule_start: string;
  schedule_end: string;
  technician_id?: string;
  service: string;
  revenue?: number;
  tags?: string[];
  notes?: string;
}

// List of GTA cities/areas
const gtaLocations = [
  { city: "Toronto", postalCodes: ["M5V 2A8", "M5S 1A1", "M4W 1A7", "M5T 1T4", "M6J 2Z4"] },
  { city: "Mississauga", postalCodes: ["L5B 2C9", "L4W 4Y4", "L5R 3G5", "L5N 1P6", "L4Z 1H8"] },
  { city: "Markham", postalCodes: ["L3R 5A4", "L3P 2J3", "L6B 0N2", "L3T 7N6", "L6E 1J1"] },
  { city: "Brampton", postalCodes: ["L6Y 4R9", "L6T 3X6", "L6P 0B2", "L6X 5A5", "L7A 0P5"] },
  { city: "Vaughan", postalCodes: ["L4H 1M9", "L4K 4V8", "L6A 3P2", "L4L 8K5", "L4J 7V6"] },
  { city: "Richmond Hill", postalCodes: ["L4C 5H2", "L4B 3N9", "L4S 1Y9", "L4E 4Y8", "L4C 9T8"] }
];

// Service types
const serviceTypes = [
  "HVAC Installation", "HVAC Repair", "Furnace Maintenance", 
  "AC Repair", "Duct Cleaning", "Water Heater Replacement",
  "Plumbing Repair", "Electrical Service", "Emergency Repair",
  "Ventilation System", "Thermostat Installation", "Home Inspection"
];

// Random data generators
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomLocation = () => {
  const location = getRandomElement(gtaLocations);
  return {
    city: location.city,
    postalCode: getRandomElement(location.postalCodes),
    province: "Ontario"
  };
};

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomName = (): string => {
  const firstNames = ["James", "Robert", "John", "Michael", "David", "Sarah", "Jennifer", "Emily", "Jessica", "Ava", "Muhammad", "Wei", "Chen", "Priya", "Ananya", "Omar", "Zara", "Carlos", "Sofia", "Olivia"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Patel", "Wang", "Kim", "Singh", "Lee", "Khan", "Zhang", "Chen", "Nguyen", "Ahmed"];
  
  return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
};

const getRandomBusinessName = (): string => {
  const prefixes = ["Superior", "Elite", "Premier", "Advanced", "Toronto", "GTA", "Professional", "Modern", "Quality", "Eastern", "Western", "Northern", "Southern", "Central"];
  const types = ["Properties", "Management", "Construction", "Buildings", "Developments", "Enterprises", "Holdings", "Industries", "Commercial", "Services", "Solutions"];
  
  return `${getRandomElement(prefixes)} ${getRandomElement(types)}`;
};

// Team roles and statuses
const teamRoles = ["technician", "technician", "technician", "technician", "dispatcher", "dispatcher", "admin", "manager"];
const teamStatuses = ["active", "active", "active", "active", "suspended"] as const;

// Generate test team members data
export const generateTestTeamMembers = async (count: number = 6): Promise<TeamMember[]> => {
  // Check for existing team members first to avoid duplicating test data
  console.log("Checking for existing team members...");
  const { data: existingTeamMembers, error: checkError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  
  if (checkError) {
    console.error("Error checking existing team members:", checkError);
    throw checkError;
  }
  
  if (existingTeamMembers && existingTeamMembers.length > 0) {
    console.log("Team members already exist - skipping team generation");
    return []; // Return empty array instead of void
  }
  
  console.log(`Generating ${count} test team members...`);
  
  const teamMembers: TeamMember[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(["James", "Robert", "John", "Michael", "David", "Sarah", "Jennifer", "Emily", "Jessica", "Ava", "Muhammad", "Wei", "Chen", "Priya", "Ananya", "Omar", "Zara", "Carlos", "Sofia", "Olivia"]);
    const lastName = getRandomElement(["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Patel", "Wang", "Kim", "Singh", "Lee", "Khan", "Zhang", "Chen", "Nguyen", "Ahmed"]);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@fixlyfy.com`;
    
    // Ensure we have a good distribution of roles
    let role;
    if (i === 0) {
      role = "admin"; // First member is admin
    } else if (i === 1) {
      role = "manager"; // Second member is manager
    } else if (i === 2 || i === 3) {
      role = "dispatcher"; // Two dispatchers
    } else {
      role = "technician"; // Rest are technicians
    }
    
    const lastLoginDate = new Date();
    lastLoginDate.setDate(lastLoginDate.getDate() - getRandomInt(0, 14));
    
    teamMembers.push({
      id: `team-${i + 1}`,
      name: name,
      email: email,
      role: role as "admin" | "manager" | "dispatcher" | "technician",
      status: getRandomElement(teamStatuses),
      avatar: "https://github.com/shadcn.png",
      lastLogin: lastLoginDate.toISOString(),
    });
  }
  
  try {
    console.log("Inserting test team members into database...");
    console.log("Sample team member data:", teamMembers[0]);
    
    // In a real app, this would insert data into the profiles table
    // For now, we're using the teamMembers array in memory
    
    console.log(`Successfully created ${teamMembers.length} team members`);
    
    // Return the generated team members to be stored in the team.ts data file
    return teamMembers;
  } catch (error) {
    console.error("Error generating test team members:", error);
    throw error;
  }
};

export const generateTestClients = async (count: number = 20): Promise<string[]> => {
  const clients: any[] = [];
  const clientIds: string[] = [];
  
  // Check for existing clients first to avoid duplicating test data
  console.log("Checking for existing clients...");
  const { data: existingClients, error: checkError } = await supabase
    .from('clients')
    .select('id')
    .limit(1);
  
  if (checkError) {
    console.error("Error checking existing clients:", checkError);
    throw checkError;
  }
  
  if (existingClients && existingClients.length > 0) {
    console.log("Clients already exist - fetching existing IDs");
    const { data: allClientIds, error } = await supabase
      .from('clients')
      .select('id')
      .limit(count);
      
    if (error) {
      console.error("Error fetching existing client IDs:", error);
      throw error;
    }
    
    if (allClientIds && allClientIds.length > 0) {
      return allClientIds.map(client => client.id);
    }
  }
  
  console.log(`Generating ${count} test clients...`);
  
  // Generate individual clients (70%)
  const individualCount = Math.floor(count * 0.7);
  for (let i = 0; i < individualCount; i++) {
    const name = getRandomName();
    const emailName = name.toLowerCase().replace(' ', '.').replace(/[^a-z\.]/g, '');
    const location = getRandomLocation();
    
    clients.push({
      name: name,
      email: `${emailName}@example.com`,
      phone: `(${getRandomInt(200, 999)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
      address: `${getRandomInt(1, 999)} ${getRandomElement(["Main", "Oak", "Maple", "Pine", "Cedar", "Elm", "Yonge", "Bloor", "Queen", "King", "Dundas"])} ${getRandomElement(["St", "Ave", "Rd", "Blvd", "Dr", "Cres", "Lane"])}`,
      city: location.city,
      state: location.province,
      zip: location.postalCode,
      country: "USA",
      type: "Residential",
      rating: getRandomInt(3, 5),
      status: getRandomElement(["active", "active", "active", "inactive"]), // Weighted towards active
      notes: getRandomElement([undefined, "Prefers afternoon appointments", "Has pets", "Senior citizen", "Repeat customer"])
    });
  }
  
  // Generate business clients (30%)
  const businessCount = count - individualCount;
  for (let i = 0; i < businessCount; i++) {
    const name = getRandomBusinessName();
    const emailName = name.toLowerCase().replace(' ', '.').replace(/[^a-z\.]/g, '');
    const location = getRandomLocation();
    
    clients.push({
      name: name,
      email: `info@${emailName.toLowerCase()}.com`,
      phone: `(${getRandomInt(200, 999)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
      address: `${getRandomInt(1, 999)} ${getRandomElement(["Business", "Commerce", "Industrial", "Corporate", "Enterprise", "Tech", "Market"])} ${getRandomElement(["Park", "Plaza", "Center", "Square", "Campus"])}`,
      city: location.city,
      state: location.province,
      zip: location.postalCode,
      country: "USA",
      type: getRandomElement(["Commercial", "Property Manager", "Commercial"]),
      rating: getRandomInt(3, 5),
      status: getRandomElement(["active", "active", "active", "inactive"]), // Weighted towards active
      notes: getRandomElement([undefined, "Large account", "Multiple locations", "Annual contract", "Preferred pricing"])
    });
  }
  
  try {
    console.log("Inserting test clients into database...");
    console.log("Sample client data:", clients[0]);
    
    // Insert into Supabase
    const { data, error } = await supabase.from('clients').insert(clients).select('id');
    
    if (error) {
      console.error("Error generating test clients:", error);
      throw error;
    }
    
    if (data) {
      clientIds.push(...data.map(client => client.id));
      console.log(`Successfully created ${data.length} clients with IDs:`, clientIds);
    } else {
      console.log("No clients were created. Data is null.");
    }
    
    return clientIds;
  } catch (error) {
    console.error("Error generating test clients:", error);
    throw error;
  }
};

export const generateTestJobs = async (clientIds: string[], count: number = 40): Promise<void> => {
  if (clientIds.length === 0) {
    console.error("No client IDs provided for job generation");
    throw new Error("No client IDs available to create jobs");
  }
  
  // Check for existing jobs first to avoid duplicating test data
  console.log("Checking for existing jobs...");
  const { data: existingJobs, error: checkError } = await supabase
    .from('jobs')
    .select('id')
    .limit(1);
  
  if (checkError) {
    console.error("Error checking existing jobs:", checkError);
    throw checkError;
  }
  
  if (existingJobs && existingJobs.length > 0) {
    console.log("Jobs already exist - skipping job generation");
    return;
  }
  
  const jobs: any[] = [];
  const now = new Date();
  const pastDate = new Date();
  pastDate.setMonth(now.getMonth() - 2);
  const futureDate = new Date();
  futureDate.setMonth(now.getMonth() + 2);
  
  const statuses = ["scheduled", "in-progress", "completed", "canceled", "pending"];
  
  console.log(`Generating ${count} test jobs for ${clientIds.length} clients...`);
  
  for (let i = 0; i < count; i++) {
    const clientId = getRandomElement(clientIds);
    const status = getRandomElement(statuses);
    const scheduledDate = getRandomDate(pastDate, futureDate);
    
    // Calculate end time (1-5 hours after start)
    const endDate = new Date(scheduledDate);
    endDate.setHours(endDate.getHours() + getRandomInt(1, 5));
    
    const jobId = `JOB-${2000 + i + 1}`;
    
    const serviceType = getRandomElement(serviceTypes);
    const tagName = serviceType.split(' ')[0];
    
    jobs.push({
      id: jobId,
      client_id: clientId,
      title: serviceType,
      description: getRandomElement([
        "Customer reported issues with system performance",
        "Routine maintenance and inspection required",
        "Complete system replacement needed",
        "Emergency repair requested",
        "Follow-up service to previous repair",
        "New installation project",
        "System efficiency evaluation",
        "Parts replacement needed"
      ]),
      status: status,
      date: scheduledDate.toISOString(),
      schedule_start: scheduledDate.toISOString(),
      schedule_end: endDate.toISOString(),
      service: serviceType,
      revenue: status === "completed" ? getRandomInt(200, 2500) : status === "in-progress" ? getRandomInt(100, 2000) : 0,
      tags: [tagName],
      notes: getRandomElement([undefined, "Rush job", "Requires specialized equipment", "Second floor unit", "Hard to access location"])
    });
  }
  
  try {
    console.log("Inserting test jobs into database...");
    console.log("Sample job data:", jobs[0]);
    
    // Insert into Supabase in batches to avoid payload size limits
    const batchSize = 10;
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      const { error } = await supabase.from('jobs').insert(batch);
      
      if (error) {
        console.error(`Error generating jobs batch ${i}-${i+batchSize}:`, error);
        throw error;
      }
    }
    
    console.log(`Successfully created ${jobs.length} jobs`);
  } catch (error) {
    console.error("Error generating test jobs:", error);
    throw error;
  }
};

export const generateAllTestData = async (clientCount: number = 20, jobCount: number = 40): Promise<string[]> => {
  try {
    console.log(`Starting generation of ${clientCount} clients and ${jobCount} jobs`);
    
    // Generate clients first
    const clientIds = await generateTestClients(clientCount);
    console.log(`Generated ${clientIds.length} client IDs`);
    
    // Then generate jobs for those clients
    if (clientIds.length > 0) {
      await generateTestJobs(clientIds, jobCount);
    } else {
      console.warn("No client IDs available, skipping job generation");
    }
    
    return clientIds;
  } catch (error) {
    console.error("Error generating test data:", error);
    throw error;
  }
};

export const useTestData = () => {
  return {
    generateAllTestData,
    generateTestClients,
    generateTestJobs,
    generateTestTeamMembers
  };
};
