
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface ReportsTechniciansProps {
  period: string;
}

const technicians = [
  {
    id: 1,
    name: "Robert Smith",
    avatar: "https://i.pravatar.cc/150?img=1",
    initials: "RS",
    completedJobs: 24,
    efficiency: 92,
    customerRating: 4.9,
    revenue: 14250
  },
  {
    id: 2,
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=2",
    initials: "JD",
    completedJobs: 18,
    efficiency: 87,
    customerRating: 4.7,
    revenue: 9800
  },
  {
    id: 3,
    name: "Emily Clark",
    avatar: "https://i.pravatar.cc/150?img=5",
    initials: "EC",
    completedJobs: 21,
    efficiency: 94,
    customerRating: 4.8,
    revenue: 11450
  },
  {
    id: 4,
    name: "Michael Wilson",
    avatar: "https://i.pravatar.cc/150?img=12",
    initials: "MW",
    completedJobs: 15,
    efficiency: 82,
    customerRating: 4.5,
    revenue: 8200
  }
];

const getRatingStars = (rating: number) => {
  return Array(5).fill(0).map((_, i) => (
    <Star 
      key={i}
      size={14} 
      className={i < Math.floor(rating) ? "text-fixlyfy-warning fill-fixlyfy-warning" : "text-fixlyfy-text-secondary"}
    />
  ));
};

export const ReportsTechnicians = ({ period }: ReportsTechniciansProps) => {
  return (
    <div className="fixlyfy-card h-full">
      <div className="p-6 border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Technician Performance</h2>
      </div>
      <div className="p-6 space-y-6">
        {technicians.map((tech) => (
          <div key={tech.id} className="animate-fade-in" style={{ animationDelay: `${tech.id * 150}ms` }}>
            <div className="flex items-center mb-3">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={tech.avatar} />
                <AvatarFallback>{tech.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{tech.name}</h3>
                <div className="flex items-center mt-1">
                  {getRatingStars(tech.customerRating)}
                  <Badge className="ml-2 bg-fixlyfy/10 text-fixlyfy">
                    {tech.customerRating}/5
                  </Badge>
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-medium">${tech.revenue.toLocaleString()}</div>
                <div className="text-xs text-fixlyfy-text-secondary">{tech.completedJobs} jobs</div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs">Efficiency</span>
                  <span className="text-xs font-medium">{tech.efficiency}%</span>
                </div>
                <Progress value={tech.efficiency} className="h-1.5" indicatorClassName="bg-fixlyfy" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
