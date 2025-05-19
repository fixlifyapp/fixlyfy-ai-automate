
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { CalendarDays, DollarSign, Plus, Trash2 } from "lucide-react";
import { TeamMemberProfile, CommissionRule, CommissionFee } from "@/types/team-member";
import { toast } from "sonner";

// Mock commission data
const mockCommission = {
  baseRate: 50,
  rules: [
    {
      id: "1",
      name: "Weekend Jobs",
      type: "schedule" as const,
      value: 60,
      condition: { days: ["saturday", "sunday"] }
    },
    {
      id: "2",
      name: "HVAC Installation",
      type: "job-type" as const,
      value: 55,
      condition: { jobType: "hvac-installation" }
    },
    {
      id: "3",
      name: "High-Value Jobs",
      type: "amount" as const,
      value: 65,
      condition: { minAmount: 1000 }
    }
  ],
  fees: [
    {
      id: "1",
      name: "Credit Card Fee",
      value: 3,
      deductFromTotal: true
    },
    {
      id: "2",
      name: "Check Processing",
      value: 1,
      deductFromTotal: false
    }
  ]
};

interface CommissionsTabProps {
  member: TeamMemberProfile;
  isEditing: boolean;
}

export const CommissionsTab = ({ member, isEditing }: CommissionsTabProps) => {
  const [baseRate, setBaseRate] = useState(mockCommission.baseRate);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(mockCommission.rules);
  const [commissionFees, setCommissionFees] = useState<CommissionFee[]>(mockCommission.fees);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleType, setNewRuleType] = useState<"schedule" | "job-type" | "amount" | "company">("job-type");
  const [newRuleValue, setNewRuleValue] = useState(50);
  
  const handleBaseRateChange = (value: number[]) => {
    if (!isEditing) return;
    setBaseRate(value[0]);
  };
  
  const handleBaseRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setBaseRate(value);
    }
  };
  
  const handleAddRule = () => {
    if (!isEditing || !newRuleName) return;
    
    const newRule: CommissionRule = {
      id: Date.now().toString(),
      name: newRuleName,
      type: newRuleType,
      value: newRuleValue,
      condition: {}
    };
    
    setCommissionRules([...commissionRules, newRule]);
    setNewRuleName("");
    setNewRuleValue(50);
    
    toast.success("Commission rule added");
  };
  
  const handleDeleteRule = (id: string) => {
    if (!isEditing) return;
    
    setCommissionRules(commissionRules.filter(rule => rule.id !== id));
    
    toast.success("Commission rule removed");
  };
  
  const handleFeeToggle = (id: string) => {
    if (!isEditing) return;
    
    setCommissionFees(commissionFees.map(fee => 
      fee.id === id 
        ? { ...fee, deductFromTotal: !fee.deductFromTotal } 
        : fee
    ));
    
    toast.success("Fee setting updated");
  };
  
  const handleFeeValueChange = (id: string, value: number) => {
    if (!isEditing) return;
    
    setCommissionFees(commissionFees.map(fee => 
      fee.id === id 
        ? { ...fee, value } 
        : fee
    ));
  };
  
  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case "schedule": return <CalendarDays className="h-4 w-4 text-indigo-500" />;
      case "job-type": return <span className="text-blue-500 text-sm font-mono">J</span>;
      case "amount": return <DollarSign className="h-4 w-4 text-green-500" />;
      case "company": return <span className="text-purple-500 text-sm font-mono">C</span>;
      default: return null;
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Base Rate & Rules */}
      <div className="space-y-6">
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Base Commission Rate</h3>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="base-rate">Base Commission Rate (%)</Label>
              <Input
                id="base-rate"
                type="number"
                value={baseRate}
                onChange={handleBaseRateInputChange}
                disabled={!isEditing}
                className="w-20 text-right"
                min="0"
                max="100"
              />
            </div>
            
            <Slider
              disabled={!isEditing}
              value={[baseRate]}
              onValueChange={handleBaseRateChange}
              max={100}
              step={1}
              className="my-4"
            />
            
            <div className="text-sm text-muted-foreground">
              This is the default commission rate for all jobs. Special rules can override this rate.
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Estimated earnings:</span>{" "}
                ${(75 * baseRate / 100).toFixed(2)}/hour based on labor cost
              </p>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <h3 className="text-lg font-medium mb-4">Commission Rules</h3>
          
          <div className="space-y-4">
            {commissionRules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  {getRuleTypeIcon(rule.type)}
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {rule.type === "schedule" ? "Schedule Override" : 
                       rule.type === "job-type" ? "Job Type Rule" :
                       rule.type === "amount" ? "Amount-Based" :
                       "Company Rate"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="font-medium">{rule.value}%</span>
                  {isEditing && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {isEditing && (
              <div className="mt-4">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Rule name"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="flex-1"
                  />
                  
                  <select 
                    className="border rounded-md px-3 py-2 bg-white"
                    value={newRuleType}
                    onChange={(e) => setNewRuleType(e.target.value as any)}
                  >
                    <option value="job-type">Job Type</option>
                    <option value="schedule">Schedule</option>
                    <option value="amount">Amount</option>
                    <option value="company">Company</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="new-rule-value">Commission Rate (%)</Label>
                  <Input
                    id="new-rule-value"
                    type="number"
                    value={newRuleValue}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 100) {
                        setNewRuleValue(value);
                      }
                    }}
                    className="w-20 text-right"
                    min="0"
                    max="100"
                  />
                </div>
                
                <Slider
                  value={[newRuleValue]}
                  onValueChange={(value) => setNewRuleValue(value[0])}
                  max={100}
                  step={1}
                  className="my-4"
                />
                
                <Button 
                  onClick={handleAddRule} 
                  className="w-full mt-2"
                  disabled={!newRuleName}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Commission Rule
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Right Column - Fees */}
      <div className="space-y-6">
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Commission Fees & Deductions</h3>
          
          <div className="space-y-6">
            {commissionFees.map(fee => (
              <div key={fee.id} className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor={`fee-${fee.id}`}>{fee.name}</Label>
                  <div className="flex items-center">
                    <Input
                      id={`fee-${fee.id}`}
                      type="number"
                      value={fee.value}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0) {
                          handleFeeValueChange(fee.id, value);
                        }
                      }}
                      disabled={!isEditing}
                      className="w-20 text-right mr-2"
                      min="0"
                      step="0.1"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                
                <Slider
                  disabled={!isEditing}
                  value={[fee.value]}
                  onValueChange={(value) => handleFeeValueChange(fee.id, value[0])}
                  max={10}
                  step={0.1}
                />
                
                <div className="flex items-center justify-between mt-2">
                  <Label htmlFor={`deduct-${fee.id}`} className="text-sm text-muted-foreground">
                    Deduct from commission total
                  </Label>
                  <Switch
                    id={`deduct-${fee.id}`}
                    checked={fee.deductFromTotal}
                    onCheckedChange={() => handleFeeToggle(fee.id)}
                    disabled={!isEditing}
                  />
                </div>
                
                <Separator className="mt-4" />
              </div>
            ))}
            
            {isEditing && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Custom Fee
              </Button>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">Commission Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Rate:</span>
                <span>{baseRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average with Rules:</span>
                <span className="text-green-600 font-medium">58%</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm">
                <span>Average Fee Deduction:</span>
                <span className="text-red-600">-3.1%</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Effective Commission Rate:</span>
                <span>54.9%</span>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground">
              This is an estimate based on historical job data and current settings.
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Advanced Commission Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="mb-1 block">Commission Cap</Label>
                <p className="text-sm text-muted-foreground">Set maximum monthly commission</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="No cap"
                  disabled={!isEditing}
                  className="w-24 text-right"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="mb-1 block">Pay Frequency</Label>
                <p className="text-sm text-muted-foreground">How often commissions are paid</p>
              </div>
              <select 
                className="border rounded-md px-3 py-1.5 bg-white"
                disabled={!isEditing}
              >
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="job">Per Job</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="mb-1 block">Require Invoice Payment</Label>
                <p className="text-sm text-muted-foreground">Only pay commission on paid invoices</p>
              </div>
              <Switch 
                checked={true}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
