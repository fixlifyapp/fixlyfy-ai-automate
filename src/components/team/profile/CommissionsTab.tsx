
import { useState } from "react";
import { TeamMemberProfile, CommissionRule, CommissionFee } from "@/types/team-member";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Plus, Calendar, Tag, DollarSign, Building } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CommissionsTabProps {
  member: TeamMemberProfile;
  isEditing: boolean;
}

// Mock commission data
const mockCommissionData = {
  baseRate: 50,
  rules: [
    { id: "1", name: "Weekend Rate", type: "schedule" as const, value: 60, condition: { days: ["saturday", "sunday"] } },
    { id: "2", name: "HVAC Jobs", type: "job-type" as const, value: 55, condition: { jobType: "hvac" } },
    { id: "3", name: "High Value Jobs", type: "amount" as const, value: 60, condition: { minAmount: 1000 } },
  ],
  fees: [
    { id: "1", name: "Credit Card Fee", value: 3, deductFromTotal: true },
    { id: "2", name: "Check Fee", value: 1.5, deductFromTotal: false },
    { id: "3", name: "Cash Fee", value: 0, deductFromTotal: false },
  ]
};

export const CommissionsTab = ({ member, isEditing }: CommissionsTabProps) => {
  const [commissionData, setCommissionData] = useState(mockCommissionData);
  const [baseRate, setBaseRate] = useState(commissionData.baseRate);
  
  const handleBaseRateChange = (value: number[]) => {
    if (!isEditing) return;
    setBaseRate(value[0]);
  };
  
  const handleFeeValueChange = (feeId: string, value: number[]) => {
    if (!isEditing) return;
    
    setCommissionData({
      ...commissionData,
      fees: commissionData.fees.map(fee => 
        fee.id === feeId ? { ...fee, value: value[0] } : fee
      )
    });
  };
  
  const handleFeeToggleChange = (feeId: string, checked: boolean) => {
    if (!isEditing) return;
    
    setCommissionData({
      ...commissionData,
      fees: commissionData.fees.map(fee => 
        fee.id === feeId ? { ...fee, deductFromTotal: checked } : fee
      )
    });
  };
  
  const handleAddRule = () => {
    toast.success("This would open a modal to add a new commission rule");
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Base Rate and Rules */}
      <div className="space-y-6">
        {/* Base Commission Rate */}
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Base Commission Rate</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Default Rate</Label>
                <Badge variant="outline" className="text-lg font-semibold">{baseRate}%</Badge>
              </div>
              
              <Slider
                disabled={!isEditing}
                value={[baseRate]}
                onValueChange={handleBaseRateChange}
                max={100}
                step={1}
                className="py-4"
              />
              
              <div className="mt-1 text-sm text-muted-foreground italic">
                Based on recent jobs, this rate equals approximately $42/hour.
              </div>
            </div>
          </div>
        </Card>
        
        {/* Commission Rules */}
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Dynamic Commission Rules</h3>
            
            {isEditing && (
              <Button 
                size="sm" 
                onClick={handleAddRule}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Rule
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Schedule Based Rules */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <h4 className="font-medium">Schedule-Based Rules</h4>
              </div>
              
              {commissionData.rules
                .filter(rule => rule.type === "schedule")
                .map(rule => (
                  <div key={rule.id} className="ml-7 mb-3 p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {rule.condition.days.map((day: string) => 
                            day.charAt(0).toUpperCase() + day.slice(1)
                          ).join(", ")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-base">{rule.value}%</Badge>
                    </div>
                  </div>
                ))}
              
              {isEditing && (
                <Button 
                  variant="outline" 
                  className="ml-7 w-full justify-start gap-1 text-sm"
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> Add Schedule Rule
                </Button>
              )}
            </div>
            
            <Separator />
            
            {/* Job Type Based Rules */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">Job Type Rules</h4>
              </div>
              
              {commissionData.rules
                .filter(rule => rule.type === "job-type")
                .map(rule => (
                  <div key={rule.id} className="ml-7 mb-3 p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Job type: {rule.condition.jobType}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-base">{rule.value}%</Badge>
                    </div>
                  </div>
                ))}
              
              {isEditing && (
                <Button 
                  variant="outline" 
                  className="ml-7 w-full justify-start gap-1 text-sm"
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> Add Job Type Rule
                </Button>
              )}
            </div>
            
            <Separator />
            
            {/* Amount Based Rules */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <h4 className="font-medium">Amount-Based Rules</h4>
              </div>
              
              {commissionData.rules
                .filter(rule => rule.type === "amount")
                .map(rule => (
                  <div key={rule.id} className="ml-7 mb-3 p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Jobs over ${rule.condition.minAmount}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-base">{rule.value}%</Badge>
                    </div>
                  </div>
                ))}
              
              {isEditing && (
                <Button 
                  variant="outline" 
                  className="ml-7 w-full justify-start gap-1 text-sm"
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> Add Amount Rule
                </Button>
              )}
            </div>
            
            <Separator />
            
            {/* External Company Rules */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-amber-500" />
                <h4 className="font-medium">Company-Specific Rules</h4>
              </div>
              
              {commissionData.rules
                .filter(rule => rule.type === "company")
                .length === 0 && (
                <div className="ml-7 p-2 text-sm text-muted-foreground italic">
                  No company-specific rules configured
                </div>
              )}
              
              {isEditing && (
                <Button 
                  variant="outline" 
                  className="ml-7 w-full justify-start gap-1 text-sm"
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> Add Company Rule
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Right Column - Fees & Bonuses */}
      <div>
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Fees & Deductions</h3>
          
          <div className="space-y-6">
            {commissionData.fees.map(fee => (
              <div key={fee.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{fee.name}</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={fee.value}
                      onChange={(e) => handleFeeValueChange(fee.id, [parseFloat(e.target.value)])}
                      disabled={!isEditing}
                      className="w-16 text-right" 
                    />
                    <span>%</span>
                  </div>
                </div>
                
                <Slider
                  disabled={!isEditing}
                  value={[fee.value]}
                  onValueChange={(value) => handleFeeValueChange(fee.id, value)}
                  max={10}
                  step={0.1}
                  className="py-2"
                />
                
                {fee.id === "1" && ( // Only for credit card fee
                  <div className="flex items-center justify-end space-x-2">
                    <Label htmlFor={`deduct-${fee.id}`} className="text-sm">
                      Deduct from total
                    </Label>
                    <Switch
                      id={`deduct-${fee.id}`}
                      checked={fee.deductFromTotal}
                      onCheckedChange={(checked) => handleFeeToggleChange(fee.id, checked)}
                      disabled={!isEditing}
                    />
                  </div>
                )}
                
                <Separator className="mt-4" />
              </div>
            ))}
            
            {isEditing && (
              <Button 
                variant="outline" 
                className="w-full justify-center gap-1"
                size="sm"
              >
                <Plus className="h-4 w-4" /> Add Custom Fee
              </Button>
            )}
          </div>
        </Card>
        
        <Card className="mt-6 p-6 border-fixlyfy-border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Bonus Structure</h3>
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bonus-type">Bonus Type</Label>
                <Select defaultValue="flat">
                  <SelectTrigger id="bonus-type" className="mt-1">
                    <SelectValue placeholder="Select bonus type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="progressive">Progressive Scale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="bonus-condition">Triggered By</Label>
                <Select defaultValue="satisfaction">
                  <SelectTrigger id="bonus-condition" className="mt-1">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="satisfaction">Customer Satisfaction</SelectItem>
                    <SelectItem value="revenue">Revenue Target</SelectItem>
                    <SelectItem value="jobs">Jobs Completed</SelectItem>
                    <SelectItem value="upsell">Successful Upsell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor="bonus-amount">Bonus Amount</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <Input
                      id="bonus-amount"
                      type="number"
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <Button type="button">
                  Add Bonus
                </Button>
              </div>
              
              <div className="mt-2 p-4 border rounded-md bg-muted/30 text-center text-sm">
                No bonus rules configured yet
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-md bg-muted/30 text-center">
              <p className="text-muted-foreground text-sm">No bonus structure configured</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
