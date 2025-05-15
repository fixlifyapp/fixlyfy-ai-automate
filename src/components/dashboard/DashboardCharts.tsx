
import { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

const revenueData = [
  { name: 'Jan', HVAC: 4000, Plumbing: 2400, Electrical: 1400 },
  { name: 'Feb', HVAC: 3000, Plumbing: 1398, Electrical: 2210 },
  { name: 'Mar', HVAC: 2000, Plumbing: 9800, Electrical: 2290 },
  { name: 'Apr', HVAC: 2780, Plumbing: 3908, Electrical: 2000 },
  { name: 'May', HVAC: 1890, Plumbing: 4800, Electrical: 2181 },
  { name: 'Jun', HVAC: 2390, Plumbing: 3800, Electrical: 2500 },
  { name: 'Jul', HVAC: 3490, Plumbing: 4300, Electrical: 2100 },
];

const jobsData = [
  { name: 'Jan', Completed: 40, Scheduled: 24, Canceled: 5 },
  { name: 'Feb', Completed: 30, Scheduled: 18, Canceled: 3 },
  { name: 'Mar', Completed: 20, Scheduled: 38, Canceled: 2 },
  { name: 'Apr', Completed: 27, Scheduled: 39, Canceled: 4 },
  { name: 'May', Completed: 18, Scheduled: 48, Canceled: 6 },
  { name: 'Jun', Completed: 23, Scheduled: 38, Canceled: 3 },
  { name: 'Jul', Completed: 34, Scheduled: 43, Canceled: 4 },
];

export const DashboardCharts = () => {
  const [period, setPeriod] = useState('monthly');

  return (
    <div className="fixlyfy-card">
      <div className="p-6 flex justify-between items-center border-b border-fixlyfy-border">
        <h2 className="text-lg font-medium">Analytics</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="p-6">
        <Tabs defaultValue="revenue">
          <TabsList className="mb-6">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, undefined]} 
                    cursor={{fill: 'rgba(138, 77, 213, 0.05)'}} 
                  />
                  <Legend />
                  <Bar dataKey="HVAC" fill="#8A4DD5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Plumbing" fill="#B084F9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Electrical" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="jobs">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={jobsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(138, 77, 213, 0.05)'}} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Completed" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Scheduled" 
                    stroke="#8A4DD5" 
                    strokeWidth={2}
                    dot={{ fill: '#8A4DD5', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Canceled" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
