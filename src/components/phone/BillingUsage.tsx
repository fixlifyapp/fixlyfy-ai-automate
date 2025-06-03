
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, DollarSign, Phone, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhoneNumberBilling } from '@/types/phone';

export const BillingUsage = () => {
  const { data: billingData = [], isLoading } = useQuery({
    queryKey: ['phone-number-billing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_number_billing')
        .select('*')
        .order('billing_period_start', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as PhoneNumberBilling[];
    }
  });

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Billing & Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading billing data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Billing & Usage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingData.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No billing data yet</h3>
              <p className="text-muted-foreground">
                Billing information will appear here once you have active phone numbers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {billingData.map((billing) => (
                <div key={billing.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {formatPhoneNumber(billing.phone_number)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(billing.billing_period_start).toLocaleDateString()} - {new Date(billing.billing_period_end).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{billing.sms_count} SMS</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{billing.call_minutes} mins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        billing.status === 'paid' ? 'default' : 
                        billing.status === 'overdue' ? 'destructive' : 'secondary'
                      }>
                        {billing.status}
                      </Badge>
                    </div>
                    <div className="text-lg font-semibold">
                      ${billing.total_amount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Due: {new Date(billing.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
