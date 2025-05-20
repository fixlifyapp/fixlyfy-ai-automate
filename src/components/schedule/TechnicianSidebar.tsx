
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { jobs } from "@/data/real-jobs";

// Derive technicians from the real jobs data
const deriveTechnicians = () => {
  const techMap = new Map();
  
  jobs.forEach(job => {
    if (!techMap.has(job.technician.name)) {
      techMap.set(job.technician.name, {
        id: job.technician.name.toLowerCase().replace(/\s+/g, '-'),
        name: job.technician.name,
        avatar: job.technician.avatar,
        initials: job.technician.initials,
        jobCount: 1,
        specialties: new Set()
      });
    } else {
      const tech = techMap.get(job.technician.name);
      tech.jobCount++;
    }
    
    // Add job tags as specialties
    if (job.tags) {
      job.tags.forEach(tag => {
        const tech = techMap.get(job.technician.name);
        if (tech && tech.specialties) {
          tech.specialties.add(tag);
        }
      });
    }
  });
  
  // Convert to array and process specialties
  return Array.from(techMap.values()).map(tech => ({
    ...tech,
    specialties: Array.from(tech.specialties).slice(0, 2) // Take first two specialties
  }));
};

const technicians = deriveTechnicians();

export const TechnicianSidebar = () => {
  const [selectedTechs, setSelectedTechs] = useState<string[]>(technicians.map(t => t.id));
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTechs = technicians.filter(tech => 
    tech.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTechSelect = (techId: string) => {
    setSelectedTechs(prev => {
      if (prev.includes(techId)) {
        return prev.filter(id => id !== techId);
      } else {
        return [...prev, techId];
      }
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTechs(filteredTechs.map(t => t.id));
    } else {
      setSelectedTechs([]);
    }
  };

  return (
    <div className="fixlyfy-card h-fit">
      <div className="p-4 border-b border-fixlyfy-border">
        <h3 className="font-medium">Technicians</h3>
      </div>
      
      <div className="p-4 border-b border-fixlyfy-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted" size={16} />
          <Input
            className="pl-8"
            placeholder="Search technicians..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="p-4 border-b border-fixlyfy-border">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="all-techs"
            checked={filteredTechs.length > 0 && selectedTechs.length === filteredTechs.length}
            onCheckedChange={handleSelectAll}
          />
          <label
            htmlFor="all-techs"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All Technicians
          </label>
        </div>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        {filteredTechs.map((tech) => (
          <div
            key={tech.id}
            className="p-4 border-b border-fixlyfy-border last:border-b-0 hover:bg-fixlyfy-bg-hover"
          >
            <div className="flex items-center space-x-3">
              <Checkbox
                id={`tech-${tech.id}`}
                checked={selectedTechs.includes(tech.id)}
                onCheckedChange={() => handleTechSelect(tech.id)}
              />
              <Avatar className="h-8 w-8">
                <AvatarImage src={tech.avatar} />
                <AvatarFallback>{tech.initials}</AvatarFallback>
              </Avatar>
              <div>
                <label
                  htmlFor={`tech-${tech.id}`}
                  className="font-medium text-sm cursor-pointer"
                >
                  {tech.name}
                </label>
                <p className="text-xs text-fixlyfy-text-secondary">
                  {tech.jobCount} job{tech.jobCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {tech.specialties && tech.specialties.length > 0 && (
              <div className="ml-8 mt-2 flex flex-wrap gap-1">
                {tech.specialties.map((specialty, i) => (
                  <span key={i} className="text-xs bg-fixlyfy-bg-interface px-2 py-0.5 rounded-full text-fixlyfy-text-secondary">
                    {specialty}
                  </span>
                ))}
                {tech.specialties.length > 2 && (
                  <span className="text-xs bg-fixlyfy-bg-interface px-2 py-0.5 rounded-full text-fixlyfy-text-secondary">
                    +{(tech.specialties as any).size - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        
        {filteredTechs.length === 0 && (
          <div className="p-4 text-center text-fixlyfy-text-secondary">
            No technicians found
          </div>
        )}
      </div>
    </div>
  );
};
