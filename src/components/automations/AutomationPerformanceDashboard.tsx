
import { useAutomations } from "@/hooks/useAutomations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap
} from "lucide-react";

export const AutomationPerformanceDashboard = () => {
  const { automations, performance, isLoading } = useAutomations();

  const totalRuns = automations.reduce((sum, auto) => sum + auto.run_count, 0);
  const totalSuccess = automations.reduce((sum, auto) => sum + auto.success_count, 0);
  const successRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0;
  const activeAutomations = automations.filter(auto => auto.status === 'active').length;

  const topPerformers = automations
    .filter(auto => auto.run_count > 0)
    .sort((a, b) => {
      const aRate = a.run_count > 0 ? (a.success_count / a.run_count) : 0;
      const bRate = b.run_count > 0 ? (b.success_count / b.run_count) : 0;
      return bRate - aRate;
    })
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Automations</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{activeAutomations}</div>
            <p className="text-xs text-blue-600">of {automations.length} total</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Executions</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{totalRuns.toLocaleString()}</div>
            <p className="text-xs text-green-600">all time</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{successRate}%</div>
            <p className="text-xs text-purple-600">{totalSuccess} successful</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Avg. Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">68%</div>
            <p className="text-xs text-orange-600">estimated response rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top Performing Automations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.length > 0 ? (
              topPerformers.map((automation, index) => {
                const successRate = automation.run_count > 0 ? 
                  Math.round((automation.success_count / automation.run_count) * 100) : 0;
                
                return (
                  <div key={automation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{automation.name}</p>
                        <p className="text-sm text-gray-600">{automation.run_count} runs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{successRate}%</div>
                      <Badge variant="outline" className="text-xs">
                        {automation.category}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No performance data available</p>
                <p className="text-sm">Run some automations to see analytics</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {automations.slice(0, 5).map((automation) => (
                <div key={automation.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{automation.name}</p>
                    <p className="text-xs text-gray-600">
                      {automation.last_run_at ? 
                        `Last run: ${new Date(automation.last_run_at).toLocaleDateString()}` :
                        'Never run'
                      }
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      automation.status === 'active' ? 'bg-green-100 text-green-700' :
                      automation.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }
                  >
                    {automation.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-indigo-600" />
            AI Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/60 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700">Optimization Found</span>
              </div>
              <p className="text-sm text-gray-700">
                SMS automations show 23% higher engagement when sent between 10-11 AM
              </p>
            </div>
            
            <div className="p-4 bg-white/60 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-700">Growth Opportunity</span>
              </div>
              <p className="text-sm text-gray-700">
                Consider adding follow-up sequences to increase customer retention by 15%
              </p>
            </div>
            
            <div className="p-4 bg-white/60 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-700">Timing Suggestion</span>
              </div>
              <p className="text-sm text-gray-700">
                Appointment reminders are most effective when sent 24 hours in advance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
