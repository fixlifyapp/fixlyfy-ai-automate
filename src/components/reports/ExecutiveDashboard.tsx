
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Crown,
  Award,
  Briefcase,
  BarChart3
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ExecutiveDashboard = () => {
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('quarter');
  
  const [executiveData, setExecutiveData] = useState({
    businessHealth: {
      score: 87,
      trend: 'improving',
      factors: [
        { name: 'Revenue Growth', score: 92, weight: 30 },
        { name: 'Customer Satisfaction', score: 88, weight: 25 },
        { name: 'Operational Efficiency', score: 85, weight: 20 },
        { name: 'Team Performance', score: 83, weight: 15 },
        { name: 'Market Position', score: 90, weight: 10 }
      ]
    },
    keyMetrics: {
      revenue: { value: 2847500, change: 23.5, target: 3000000, ytd: 8542500 },
      profit_margin: { value: 24.3, change: 2.8, target: 25.0 },
      customer_growth: { value: 247, change: 18.7, target: 300 },
      retention_rate: { value: 94.2, change: 5.3, target: 95.0 }
    },
    performance: [
      { period: 'Q1', revenue: 2100000, profit: 21.5, customers: 180, efficiency: 82 },
      { period: 'Q2', revenue: 2450000, profit: 23.1, customers: 215, efficiency: 85 },
      { period: 'Q3', revenue: 2847500, profit: 24.3, customers: 247, efficiency: 87 },
      { period: 'Q4 (Projected)', revenue: 3200000, profit: 25.8, customers: 285, efficiency: 90 }
    ],
    strategicInitiatives: [
      {
        name: 'Digital Transformation',
        status: 'on_track',
        progress: 78,
        budget_used: 245000,
        budget_total: 350000,
        roi_projected: 2.3,
        completion_date: '2024-09-30'
      },
      {
        name: 'Market Expansion',
        status: 'ahead',
        progress: 92,
        budget_used: 180000,
        budget_total: 200000,
        roi_projected: 3.1,
        completion_date: '2024-07-15'
      },
      {
        name: 'Team Development',
        status: 'at_risk',
        progress: 45,
        budget_used: 85000,
        budget_total: 150000,
        roi_projected: 1.8,
        completion_date: '2024-12-31'
      }
    ],
    marketPosition: {
      market_share: 12.5,
      competitive_ranking: 3,
      brand_recognition: 78,
      nps_score: 67
    },
    riskFactors: [
      { 
        factor: 'Seasonal Revenue Dip', 
        probability: 65, 
        impact: 'medium',
        mitigation: 'Diversify service offerings for winter months'
      },
      { 
        factor: 'Key Technician Retention', 
        probability: 40, 
        impact: 'high',
        mitigation: 'Implement enhanced retention program'
      },
      { 
        factor: 'Economic Downturn', 
        probability: 25, 
        impact: 'high',
        mitigation: 'Build cash reserves and flexible cost structure'
      }
    ]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-blue-100 text-blue-800';
      case 'ahead': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-orange-100 text-orange-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-7 w-7 text-purple-600" />
            Executive Dashboard
          </h1>
          <p className="text-gray-600">Strategic overview and key performance indicators</p>
        </div>
        <div className="flex items-center gap-2">
          {(['month', 'quarter', 'year'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Business Health Score */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Business Health Score
            <Badge className="bg-purple-100 text-purple-800 ml-2">
              {executiveData.businessHealth.score}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{executiveData.businessHealth.score}</span>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Improving</span>
                </div>
              </div>
              <Progress value={executiveData.businessHealth.score} className="h-3" />
              <p className="text-sm text-gray-600">
                Overall business performance based on weighted key factors
              </p>
            </div>
            <div className="space-y-3">
              {executiveData.businessHealth.factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{factor.name}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={factor.score} className="w-20 h-2" />
                    <span className="text-sm font-medium w-8">{factor.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Executive Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                {executiveData.keyMetrics.revenue.change}%
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm text-gray-600">Revenue</h3>
              <p className="text-2xl font-bold">{formatCurrency(executiveData.keyMetrics.revenue.value)}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>YTD: {formatCurrency(executiveData.keyMetrics.revenue.ytd)}</span>
                <span>Target: {formatCurrency(executiveData.keyMetrics.revenue.target)}</span>
              </div>
              <Progress 
                value={(executiveData.keyMetrics.revenue.value / executiveData.keyMetrics.revenue.target) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                {executiveData.keyMetrics.profit_margin.change}%
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm text-gray-600">Profit Margin</h3>
              <p className="text-2xl font-bold">{executiveData.keyMetrics.profit_margin.value}%</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Target: {executiveData.keyMetrics.profit_margin.target}%</span>
              </div>
              <Progress 
                value={(executiveData.keyMetrics.profit_margin.value / executiveData.keyMetrics.profit_margin.target) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                {executiveData.keyMetrics.customer_growth.change}%
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm text-gray-600">New Customers</h3>
              <p className="text-2xl font-bold">{executiveData.keyMetrics.customer_growth.value}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Target: {executiveData.keyMetrics.customer_growth.target}</span>
              </div>
              <Progress 
                value={(executiveData.keyMetrics.customer_growth.value / executiveData.keyMetrics.customer_growth.target) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                {executiveData.keyMetrics.retention_rate.change}%
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm text-gray-600">Retention Rate</h3>
              <p className="text-2xl font-bold">{executiveData.keyMetrics.retention_rate.value}%</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Target: {executiveData.keyMetrics.retention_rate.target}%</span>
              </div>
              <Progress 
                value={(executiveData.keyMetrics.retention_rate.value / executiveData.keyMetrics.retention_rate.target) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={executiveData.performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : 
                  name === 'profit' ? `${value}%` : value,
                  name === 'revenue' ? 'Revenue' :
                  name === 'profit' ? 'Profit Margin' :
                  name === 'customers' ? 'New Customers' : 'Efficiency'
                ]}
              />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              <Area type="monotone" dataKey="customers" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Strategic Initiatives & Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Initiatives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Strategic Initiatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {executiveData.strategicInitiatives.map((initiative, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{initiative.name}</h4>
                    <Badge className={getStatusColor(initiative.status)}>
                      {initiative.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{initiative.progress}%</span>
                    </div>
                    <Progress value={initiative.progress} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span>Budget: ${initiative.budget_used.toLocaleString()} / ${initiative.budget_total.toLocaleString()}</span>
                      </div>
                      <div>
                        <span>Projected ROI: {initiative.roi_projected}x</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {executiveData.riskFactors.map((risk, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{risk.factor}</h4>
                    <Badge variant="outline" className={getImpactColor(risk.impact)}>
                      {risk.impact} impact
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Probability</span>
                      <span>{risk.probability}%</span>
                    </div>
                    <Progress value={risk.probability} className="h-2" />
                    <p className="text-xs text-gray-600">{risk.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Position */}
      <Card>
        <CardHeader>
          <CardTitle>Market Position & Competitive Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{executiveData.marketPosition.market_share}%</div>
              <div className="text-sm text-gray-600">Market Share</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">#{executiveData.marketPosition.competitive_ranking}</div>
              <div className="text-sm text-gray-600">Market Ranking</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{executiveData.marketPosition.brand_recognition}%</div>
              <div className="text-sm text-gray-600">Brand Recognition</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{executiveData.marketPosition.nps_score}</div>
              <div className="text-sm text-gray-600">NPS Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
