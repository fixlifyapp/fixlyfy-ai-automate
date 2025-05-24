
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Target
} from "lucide-react";
import { useClientAnalytics, ClientValueData } from "@/hooks/useClientAnalytics";
import { toast } from "sonner";

export const ClientValuePanel = () => {
  console.log('ClientValuePanel: Component rendering');
  
  const { clientValueData, isLoading } = useClientAnalytics();
  
  console.log('ClientValuePanel: Data state', { clientValueData, isLoading });
  
  const topClients = clientValueData?.slice(0, 5) || [];
  const atRiskClients = clientValueData?.filter(client => client.churnRisk === 'high').slice(0, 3) || [];
  
  const handleReactivationSuggestion = (clientName: string) => {
    toast.success(`AI Suggestion: Send reactivation offer to ${clientName}`, {
      description: "Consider offering a maintenance package or seasonal service discount"
    });
  };
  
  const getChurnRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
    }
  };
  
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Value Clients */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            Top Value Clients
          </CardTitle>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            🆕 UNIQUE
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {topClients.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No client data available</p>
          ) : (
            topClients.map((client, index) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.jobCount} jobs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${client.lifetimeValue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">LTV</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      {/* At-Risk Clients */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            Churn Risk Analysis
          </CardTitle>
          <Badge variant="outline" className="bg-red-100 text-red-700">
            AI Powered
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {atRiskClients.length === 0 ? (
            <div className="text-center py-4">
              <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-600 font-medium">Great! No high-risk clients</p>
              <p className="text-sm text-gray-600">All clients are engaged</p>
            </div>
          ) : (
            atRiskClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <Badge className={`text-xs px-2 py-1 ${getChurnRiskColor(client.churnRisk)}`}>
                      {client.churnRisk.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {client.daysSinceLastJob} days ago
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${client.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Total Revenue</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleReactivationSuggestion(client.name)}
                  >
                    AI Suggest
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientValuePanel;
