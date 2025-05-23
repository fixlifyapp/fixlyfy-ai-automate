import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { CalendarDays, DollarSign, Plus, Trash2, Loader2 } from "lucide-react";
import { TeamMemberProfile, CommissionRule, CommissionFee } from "@/types/team-member";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRBAC } from "@/components/auth/RBACProvider";
import { UpdateTeamMemberCommissionParams } from "@/types/database";

interface CommissionsTabProps {
  member: TeamMemberProfile;
  isEditing: boolean;
}

export const CommissionsTab = ({ member, isEditing }: CommissionsTabProps) => {
  const [baseRate, setBaseRate] = useState(member.commissionRate || 50);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(member.commissionRules || []);
  const [commissionFees, setCommissionFees] = useState<CommissionFee[]>(member.commissionFees || []);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleType, setNewRuleType] = useState<"schedule" | "job-type" | "amount" | "company">("job-type");
  const [newRuleValue, setNewRuleValue] = useState(50);
  const [isSaving, setIsSaving] = useState(false);
  const { hasPermission } = useRBAC();
  
  const canManageCommissions = hasPermission("users.edit");
  
  // Update state when member data changes
  useEffect(() => {
    if (member) {
      setBaseRate(member.commissionRate || 50);
      setCommissionRules(member.commissionRules || []);
      setCommissionFees(member.commissionFees || []);
    }
  }, [member]);
  
  const handleBaseRateChange = (value: number[]) => {
    if (!isEditing || !canManageCommissions) return;
    setBaseRate(value[0]);
  };
  
  const handleBaseRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing || !canManageCommissions) return;
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setBaseRate(value);
    }
  };
  
  const handleSaveCommissionChanges = async () => {
    if (!isEditing || !canManageCommissions || !member) return;
    
    setIsSaving(true);
    
    try {
      // Prepare the parameters for the RPC function
      const params: UpdateTeamMemberCommissionParams = {
        p_user_id: member.id,
        p_base_rate: baseRate,
        p_rules: commissionRules,
        p_fees: commissionFees
      };
      
      // Call the update_team_member_commission RPC function
      const { error } = await supabase.rpc(
        'update_team_member_commission', 
        params
      );
        
      if (error) throw error;
      
      toast.success("Commission settings saved successfully");
    } catch (error: any) {
      console.error("Error saving commission settings:", error);
      toast.error("Failed to save commission settings");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddRule = () => {
    if (!isEditing || !newRuleName || !canManageCommissions) return;
    
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
    if (!isEditing || !canManageCommissions) return;
    
    setCommissionRules(commissionRules.filter(rule => rule.id !== id));
    
    toast.success("Commission rule removed");
  };
  
  const handleFeeToggle = (id: string) => {
    if (!isEditing || !canManageCommissions) return;
    
    setCommissionFees(commissionFees.map(fee => 
      fee.id === id 
        ? { ...fee, deductFromTotal: !fee.deductFromTotal } 
        : fee
    ));
  };
  
  const handleFeeValueChange = (id: string, value: number) => {
    if (!isEditing || !canManageCommissions) return;
    
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
  
  // If user doesn't have permission to edit
  if (!canManageCommissions && !isEditing) {
    return (
      <div className="space-y-6">
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <div className="flex justify-center py-8">
            <div className="text-center">
              <p className="text-muted-foreground">
                You don't have permission to manage commission settings.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Base Rate & Rules */}
      <div className="space-y-6">
        <Card className="p-6 border-fixlyfy-border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Base Commission Rate</h3>
            {isEditing && (
              <Button 
                onClick={handleSaveCommissionChanges} 
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            )}
          </div>
          
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
            {commissionRules.length === 0 ? (
              <div className="text-center p-4 bg-gray-50 rounded-md text-muted-foreground">
                No commission rules defined yet.
              </div>
            ) : (
              commissionRules.map(rule => (
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
              ))
            )}
            
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
            {commissionFees.length === 0 ? (
              <div className="text-center p-4 bg-gray-50 rounded-md text-muted-foreground">
                No commission fees defined yet.
              </div>
            ) : (
              commissionFees.map(fee => (
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
              ))
            )}
            
            {isEditing && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => {
                  const newFee: CommissionFee = {
                    id: Date.now().toString(),
                    name: "New Fee",
                    value: 3,
                    deductFromTotal: true
                  };
                  setCommissionFees([...commissionFees, newFee]);
                  toast.success("Fee added");
                }}
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
              
              {commissionRules.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Average with Rules:</span>
                  <span className="text-green-600 font-medium">
                    {Math.round(commissionRules.reduce((acc, rule) => acc + rule.value, 0) / 
                      (commissionRules.length || 1))}%
                  </span>
                </div>
              )}
              
              <Separator className="my-2" />
              
              {commissionFees.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Average Fee Deduction:</span>
                  <span className="text-red-600">
                    -{(commissionFees
                      .filter(fee => fee.deductFromTotal)
                      .reduce((acc, fee) => acc + fee.value, 0)).toFixed(1)}%
                  </span>
                </div>
              )}
              
              <div className="flex justify-between font-medium">
                <span>Effective Commission Rate:</span>
                <span>{Math.max(0, baseRate - 
                  (commissionFees
                    .filter(fee => fee.deductFromTotal)
                    .reduce((acc, fee) => acc + fee.value, 0)).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground">
              This is an estimate based on historical job data and current settings.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
