
// Global tags for service business
export interface Tag {
  id: string;
  name: string;
  color: string;
}

export const globalTags: Tag[] = [
  {
    id: "tag-hvac",
    name: "HVAC",
    color: "bg-purple-50 border-purple-200 text-purple-600",
  },
  {
    id: "tag-residential",
    name: "Residential",
    color: "bg-blue-50 border-blue-200 text-blue-600",
  },
  {
    id: "tag-commercial",
    name: "Commercial",
    color: "bg-indigo-50 border-indigo-200 text-indigo-600",
  },
  {
    id: "tag-emergency",
    name: "Emergency",
    color: "bg-red-50 border-red-200 text-red-600",
  },
  {
    id: "tag-maintenance",
    name: "Maintenance",
    color: "bg-green-50 border-green-200 text-green-600",
  },
  {
    id: "tag-installation",
    name: "Installation",
    color: "bg-amber-50 border-amber-200 text-amber-600",
  },
  {
    id: "tag-repair",
    name: "Repair",
    color: "bg-orange-50 border-orange-200 text-orange-600",
  },
  {
    id: "tag-water-heater",
    name: "Water Heater",
    color: "bg-cyan-50 border-cyan-200 text-cyan-600",
  },
  {
    id: "tag-plumbing",
    name: "Plumbing",
    color: "bg-sky-50 border-sky-200 text-sky-600",
  },
  {
    id: "tag-electrical",
    name: "Electrical",
    color: "bg-yellow-50 border-yellow-200 text-yellow-600",
  },
];

// Helper function to get color for a tag
export const getTagColor = (tagName: string): string => {
  const tag = globalTags.find(t => t.name === tagName);
  if (tag) return tag.color;
  
  // For custom tags, cycle through available colors
  const colorValues = globalTags.map(t => t.color);
  const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % colorValues.length;
  return colorValues[index];
};
