
import { supabase } from "@/integrations/supabase/client";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  type: string;
  rating: number;
  status: string;
  notes?: string;
}

interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  scheduledDate: string;
  estimatedDuration: number;
  technicianId?: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  serviceType: string;
  price?: number;
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

export const generateTestClients = async (count: number = 20): Promise<string[]> => {
  const clients: Client[] = [];
  const clientIds: string[] = [];
  
  // Generate individual clients (70%)
  const individualCount = Math.floor(count * 0.7);
  for (let i = 0; i < individualCount; i++) {
    const name = getRandomName();
    const emailName = name.toLowerCase().replace(' ', '.').replace(/[^a-z\.]/g, '');
    const location = getRandomLocation();
    
    const clientId = `CLT-${1000 + i + 1}`;
    clientIds.push(clientId);
    
    clients.push({
      id: clientId,
      name: name,
      email: `${emailName}@example.com`,
      phone: `(${getRandomInt(200, 999)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
      address: `${getRandomInt(1, 999)} ${getRandomElement(["Main", "Oak", "Maple", "Pine", "Cedar", "Elm", "Yonge", "Bloor", "Queen", "King", "Dundas"])} ${getRandomElement(["St", "Ave", "Rd", "Blvd", "Dr", "Cres", "Lane"])}`,
      city: location.city,
      postalCode: location.postalCode,
      province: location.province,
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
    
    const clientId = `CLT-${1000 + individualCount + i + 1}`;
    clientIds.push(clientId);
    
    clients.push({
      id: clientId,
      name: name,
      email: `info@${emailName.toLowerCase()}.com`,
      phone: `(${getRandomInt(200, 999)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
      address: `${getRandomInt(1, 999)} ${getRandomElement(["Business", "Commerce", "Industrial", "Corporate", "Enterprise", "Tech", "Market"])} ${getRandomElement(["Park", "Plaza", "Center", "Square", "Campus"])}`,
      city: location.city,
      postalCode: location.postalCode,
      province: location.province,
      type: getRandomElement(["Commercial", "Property Manager", "Commercial"]),
      rating: getRandomInt(3, 5),
      status: getRandomElement(["active", "active", "active", "inactive"]), // Weighted towards active
      notes: getRandomElement([undefined, "Large account", "Multiple locations", "Annual contract", "Preferred pricing"])
    });
  }
  
  try {
    console.log("Generating test clients data...");
    // This would typically insert into a Supabase table - for now we're just returning the data
    // In a real implementation you would do:
    // const { error } = await supabase.from('clients').insert(clients);
    
    return clientIds;
  } catch (error) {
    console.error("Error generating test clients:", error);
    return [];
  }
};

export const generateTestJobs = async (clientIds: string[], count: number = 40): Promise<void> => {
  const jobs: Job[] = [];
  const now = new Date();
  const pastDate = new Date();
  pastDate.setMonth(now.getMonth() - 2);
  const futureDate = new Date();
  futureDate.setMonth(now.getMonth() + 2);
  
  const statuses = ["scheduled", "in-progress", "completed", "cancelled", "pending"];
  const priorities = ["low", "medium", "high", "urgent"];
  
  for (let i = 0; i < count; i++) {
    const clientId = getRandomElement(clientIds);
    const status = getRandomElement(statuses);
    const scheduledDate = getRandomDate(pastDate, futureDate).toISOString();
    const location = getRandomLocation();
    
    jobs.push({
      id: `JOB-${2000 + i + 1}`,
      clientId: clientId,
      title: getRandomElement(serviceTypes),
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
      priority: getRandomElement(priorities),
      scheduledDate: scheduledDate,
      estimatedDuration: getRandomInt(1, 5),
      technicianId: getRandomElement([undefined, "TECH-1", "TECH-2", "TECH-3", "TECH-4", "TECH-5"]),
      address: `${getRandomInt(1, 999)} ${getRandomElement(["Main", "Oak", "Maple", "Pine", "Cedar", "Elm", "Yonge", "Bloor", "Queen", "King"])} ${getRandomElement(["St", "Ave", "Rd", "Blvd", "Dr", "Cres"])}`,
      city: location.city,
      postalCode: location.postalCode,
      province: location.province,
      serviceType: getRandomElement(serviceTypes),
      price: status === "completed" ? getRandomInt(200, 2500) : undefined,
      notes: getRandomElement([undefined, "Rush job", "Requires specialized equipment", "Second floor unit", "Hard to access location"])
    });
  }
  
  try {
    console.log("Generating test jobs data...");
    // This would typically insert into a Supabase table - for now we're just logging data
    // In a real implementation you would do:
    // const { error } = await supabase.from('jobs').insert(jobs);
  } catch (error) {
    console.error("Error generating test jobs:", error);
  }
};

export const generateAllTestData = async (): Promise<void> => {
  try {
    // Generate clients first
    const clientIds = await generateTestClients(20);
    
    // Then generate jobs for those clients
    if (clientIds.length > 0) {
      await generateTestJobs(clientIds, 40);
    }
    
    return;
  } catch (error) {
    console.error("Error generating test data:", error);
  }
};

export const useTestData = () => {
  return {
    generateAllTestData,
    generateTestClients,
    generateTestJobs
  };
};
