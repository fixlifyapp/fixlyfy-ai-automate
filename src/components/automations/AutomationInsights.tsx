
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { CreateAutomationDialog } from '@/components/automations/CreateAutomationDialog';

// Mock data for automation insights
const performanceData = [
  { day: 'Mon', runs: 12, success: 11 },
  { day: 'Tue', runs: 18, success: 17 },
  { day: 'Wed', runs: 15, success: 14 },
  { day: 'Thu', runs: 22, success: 21 },
  { day: 'Fri', runs: 28, success: 26 },
  { day: 'Sat', runs: 10, success: 10 },
  { day: 'Sun', runs: 8, success: 8 },
];

export const AutomationInsights = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const handleCreateSuggested = () => {
    setSelectedTemplate("estimate-follow");
    setCreateDialogOpen(true);
  };
  
  return (
    <div className="fixlyfy-card h-full">
      <div className="p-6 border-b border-fixlyfy-border flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <h2 className="text-lg font-medium ml-3">Automation Insights</h2>
        </div>
        <Badge className="bg-fixlyfy-success">AI Powered</Badge>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="p-4 bg-fixlyfy/5 border border-fixlyfy/20 rounded-md">
          <div className="flex items-start">
            <Info className="text-fixlyfy mt-0.5 mr-3 shrink-0" size={18} />
            <div>
              <p className="font-medium mb-1">Suggested Automation</p>
              <p className="text-sm text-fixlyfy-text-secondary">
                Based on your patterns, adding a "3-day estimate follow-up" automation could increase conversions.
              </p>
              <Button variant="link" className="text-fixlyfy text-xs p-0 h-auto mt-2" onClick={handleCreateSuggested}>
                Create this automation <ArrowRight size={12} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-lg font-medium mb-4">Weekly Performance</p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="runs" 
                  stroke="#6366F1" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="success" 
                  stroke="#10B981" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></div>
              <span className="text-fixlyfy-text-secondary">Total Runs</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></div>
              <span className="text-fixlyfy-text-secondary">Successful</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="font-medium">AI Recommendations</p>
          <div className="space-y-3">
            <div className="p-3 bg-fixlyfy-success/5 border border-fixlyfy-success/20 rounded-md">
              <div className="flex items-start">
                <TrendingUp className="text-fixlyfy-success mr-2 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium">Payment Reminder Effectiveness</p>
                  <p className="text-xs text-fixlyfy-text-secondary mt-1">
                    Your payment reminder automation has improved on-time payments by 23% this month.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-fixlyfy-info/5 border border-fixlyfy-info/20 rounded-md">
              <div className="flex items-start">
                <Brain className="text-fixlyfy-info mr-2 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium">SMS vs Email Effectiveness</p>
                  <p className="text-xs text-fixlyfy-text-secondary mt-1">
                    SMS reminders have 34% higher engagement than email. Consider switching more automations to SMS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreateAutomationDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        initialTemplate={selectedTemplate} 
      />
    </div>
  );
};
