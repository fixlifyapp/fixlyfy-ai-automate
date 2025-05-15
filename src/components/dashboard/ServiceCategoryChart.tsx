
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

// Mock data for service category breakdown
const serviceData = [
  { name: 'HVAC', value: 45, color: '#8A4DD5' },
  { name: 'Plumbing', value: 30, color: '#B084F9' },
  { name: 'Electrical', value: 15, color: '#3B82F6' },
  { name: 'Other', value: 10, color: '#E5E7EB' },
];

// Mock data for customer satisfaction
const satisfactionData = [
  { name: 'Very Satisfied', value: 62, color: '#10B981' },
  { name: 'Satisfied', value: 28, color: '#3B82F6' },
  { name: 'Neutral', value: 7, color: '#F59E0B' },
  { name: 'Unsatisfied', value: 3, color: '#EF4444' },
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333">
        {`${payload.name}: ${value}%`}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-fixlyfy-border rounded shadow-sm">
        <p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export const ServiceCategoryChart = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Service Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="service">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="service">Service Categories</TabsTrigger>
            <TabsTrigger value="satisfaction">Customer Satisfaction</TabsTrigger>
          </TabsList>
          <TabsContent value="service" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  activeShape={renderActiveShape}
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="satisfaction" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={satisfactionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  activeShape={renderActiveShape}
                >
                  {satisfactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
