
import { Card, CardContent } from "@/components/ui/card";

interface TechnicianCardProps {
  name: string;
  jobCount: number;
  revenue: number;
  index: number;
  formatValue: (value: number) => string;
}

export const TechnicianCard = ({
  name,
  jobCount,
  revenue,
  index,
  formatValue
}: TechnicianCardProps) => {
  return (
    <Card key={index} className="shadow-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">{name}</h3>
            <p className="text-fixlyfy-text-secondary text-sm">{jobCount} Jobs Completed</p>
          </div>
          <div className="bg-fixlyfy text-white px-2 py-1 rounded-md text-sm font-medium">
            #{index + 1}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xl font-semibold">{formatValue(revenue)}</p>
          <p className="text-xs text-fixlyfy-text-secondary">Total Revenue</p>
        </div>
      </CardContent>
    </Card>
  );
};
