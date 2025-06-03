
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Bot, Settings, MapPin, DollarSign, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhoneNumberAssignment } from '@/types/phone';
import { toast } from '@/hooks/use-toast';
import { NumberConfigDialog } from './NumberConfigDialog';

export const NumbersManagement = () => {
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumberAssignment | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['phone-number-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_number_assignments')
        .select(`
          *,
          purchase:phone_number_purchases(
            *,
            plan:phone_number_plans(*)
          )
        `)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data as PhoneNumberAssignment[];
    }
  });

  const toggleNumberStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('phone_number_assignments')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-number-assignments'] });
      toast({
        title: "Number Status Updated",
        description: "Phone number status has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating number status:', error);
      toast({
        title: "Error",
        description: "Failed to update number status. Please try again.",
        variant: "destructive"
      });
    }
  });

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const openConfigDialog = (assignment: PhoneNumberAssignment) => {
    setSelectedNumber(assignment);
    setShowConfigDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Your Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Your Phone Numbers ({assignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No phone numbers</h3>
              <p className="text-muted-foreground mb-4">
                Purchase your first phone number to get started
              </p>
              <Button onClick={() => {/* Navigate to purchase tab */}}>
                Purchase Numbers
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      assignment.ai_settings?.enabled 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {assignment.ai_settings?.enabled ? <Bot className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-lg">
                          {formatPhoneNumber(assignment.phone_number)}
                        </span>
                        {assignment.assigned_name && (
                          <span className="text-sm text-gray-600">
                            ({assignment.assigned_name})
                          </span>
                        )}
                        <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                          {assignment.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {assignment.ai_settings?.enabled && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <Bot className="h-3 w-3 mr-1" />
                            AI Enabled
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Plan: {assignment.purchase?.plan?.name || 'Unknown'}</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>${assignment.purchase?.monthly_fee || 0}/month</span>
                        </div>
                        <span>Added: {new Date(assignment.assigned_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConfigDialog(assignment)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    
                    <Switch
                      checked={assignment.is_active}
                      onCheckedChange={(checked) => 
                        toggleNumberStatus.mutate({ id: assignment.id, isActive: checked })
                      }
                      disabled={toggleNumberStatus.isPending}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedNumber && (
        <NumberConfigDialog
          open={showConfigDialog}
          onOpenChange={setShowConfigDialog}
          assignment={selectedNumber}
        />
      )}
    </>
  );
};
