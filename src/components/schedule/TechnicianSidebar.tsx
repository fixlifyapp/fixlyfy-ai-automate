
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter } from "lucide-react";
import { teamMembers } from "@/data/team";

// Sample technicians with enhanced data
const technicians = teamMembers.map(member => ({
  ...member,
  skills: ['HVAC', 'Plumbing', 'Electrical'].filter(() => Math.random() > 0.5),
  status: Math.random() > 0.7 ? 'busy' : Math.random() > 0.3 ? 'available' : 'on-leave',
  jobCount: Math.floor(Math.random() * 8),
  serviceArea: ['Downtown', 'East Side', 'West End', 'North District'][Math.floor(Math.random() * 4)]
}));

export const TechnicianSidebar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = showAvailableOnly ? tech.status === 'available' : true;
    const matchesSkills = selectedSkills.length > 0 
      ? tech.skills.some(skill => selectedSkills.includes(skill))
      : true;
    
    return matchesSearch && matchesAvailability && matchesSkills;
  });
  
  const allSkills = Array.from(new Set(technicians.flatMap(tech => tech.skills)));
  
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };
  
  return (
    <div className="fixlyfy-card flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-fixlyfy-border">
        <h2 className="text-lg font-semibold mb-4">Technicians</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-secondary" size={16} />
          <Input 
            placeholder="Search technicians..." 
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="available" 
            checked={showAvailableOnly}
            onCheckedChange={(checked) => setShowAvailableOnly(!!checked)}
          />
          <label 
            htmlFor="available" 
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Available Only
          </label>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Filter by Skills</p>
          <div className="flex flex-wrap gap-2">
            {allSkills.map(skill => (
              <Badge 
                key={skill}
                variant={selectedSkills.includes(skill) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleSkill(skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredTechnicians.map(tech => (
          <div key={tech.id} className="p-4 border-b border-fixlyfy-border hover:bg-fixlyfy-bg-interface/30 cursor-pointer">
            <div className="flex items-center mb-2">
              <Avatar className="h-10 w-10 mr-3">
                <img src={tech.avatar} alt={tech.name} />
              </Avatar>
              <div>
                <h3 className="text-sm font-medium">{tech.name}</h3>
                <div className="flex items-center mt-1">
                  <span 
                    className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                      tech.status === 'available' ? 'bg-fixlyfy-success' : 
                      tech.status === 'busy' ? 'bg-fixlyfy-warning' : 
                      'bg-fixlyfy-danger'
                    }`}
                  />
                  <span className="text-xs text-fixlyfy-text-secondary capitalize">{tech.status}</span>
                </div>
              </div>
              <div className="ml-auto text-right">
                <Badge variant="outline" className="mb-1">{tech.jobCount} jobs</Badge>
                <p className="text-xs text-fixlyfy-text-secondary">{tech.serviceArea}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {tech.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
