
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  Bot, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Calendar,
  Star,
  Phone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface AIAnalytics {
  totalCalls: number;
  resolvedCalls: number;
  transferredCalls: number;
  successRate: number;
  averageCallDuration: number;
  appointmentsScheduled: number;
  customerSatisfactionAverage: number;
  recentCalls: Array<{
    id: string;
    clientPhone: string;
    duration: number;
    status: string;
    resolutionType: string;
    appointmentScheduled: boolean;
    customerSatisfaction: number;
    startedAt: string;
    summary: string;
  }>;
}

export const AICallAnalytics = () => {
  const [analytics, setAnalytics] = useState<AIAnalytics>({
    totalCalls: 0,
    resolvedCalls: 0,
    transferredCalls: 0,
    successRate: 0,
    averageCallDuration: 0,
    appointmentsScheduled: 0,
    customerSatisfactionAverage: 0,
    recentCalls: []
  });
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-ai-call-analytics', {
        body: { timeframe }
      });

      if (error) throw error;
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load AI call analytics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const getResolutionBadge = (resolutionType: string) => {
    switch (resolutionType) {
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'transferred':
        return <Badge className="bg-yellow-100 text-yellow-800">Transferred</Badge>;
      case 'voicemail':
        return <Badge className="bg-blue-100 text-blue-800">Voicemail</Badge>;
      case 'abandoned':
        return <Badge className="bg-red-100 text-red-800">Abandoned</Badge>;
      default:
        return <Badge variant="outline">{resolutionType}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Timeframe Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            AI Call Analytics
          </h2>
          <p className="text-muted-foreground">Monitor your AI dispatcher performance</p>
        </div>
        <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Phone className="h-4 w-4" />
              Total AI Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.totalCalls}</div>
            <div className="text-xs text-muted-foreground">
              {analytics.resolvedCalls} resolved, {analytics.transferredCalls} transferred
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.successRate}%</div>
            <div className="text-xs text-muted-foreground">
              Calls resolved without transfer
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatDuration(analytics.averageCallDuration)}
            </div>
            <div className="text-xs text-muted-foreground">
              Average call length
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics.appointmentsScheduled}</div>
            <div className="text-xs text-muted-foreground">
              Scheduled by AI
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Satisfaction */}
      {analytics.customerSatisfactionAverage > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-yellow-600">
                {analytics.customerSatisfactionAverage}/5
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= analytics.customerSatisfactionAverage
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Average customer rating
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent AI Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent AI Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentCalls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No AI calls yet</p>
              <p className="text-sm">AI call logs will appear here once you start receiving calls</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.recentCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatPhoneNumber(call.clientPhone)}
                        </span>
                        {getResolutionBadge(call.resolutionType)}
                        {call.appointmentScheduled && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            Appointment
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>{formatDuration(call.duration)}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDistanceToNow(new Date(call.startedAt), { addSuffix: true })}</span>
                        {call.customerSatisfaction && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {call.customerSatisfaction}/5
                            </span>
                          </>
                        )}
                      </div>
                      {call.summary && (
                        <p className="text-sm text-muted-foreground mt-1 max-w-md truncate">
                          {call.summary}
                        </p>
                      )}
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
