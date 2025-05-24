
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign, 
  UserCheck,
  Sparkles,
  Zap,
  Star,
  TrendingUp
} from "lucide-react";

interface AutomationTemplatesProps {
  onCreateFromTemplate: (templateId: string) => void;
}

export const AutomationTemplates = ({ onCreateFromTemplate }: AutomationTemplatesProps) => {
  const templates = [
    {
      id: 'appointment-reminder',
      name: 'Appointment Reminders',
      description: 'Automatically send SMS reminders 24 hours and 2 hours before scheduled appointments',
      category: 'reminders',
      icon: <Clock className="w-5 h-5" />,
      triggers: ['job_scheduled'],
      actions: ['send_sms'],
      popularity: 95,
      estimated_engagement: '85%',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'follow-up-sequence',
      name: 'Post-Job Follow-up',
      description: 'Send thank you message, request review, and offer maintenance after job completion',
      category: 'follow-ups',
      icon: <MessageSquare className="w-5 h-5" />,
      triggers: ['job_completed'],
      actions: ['send_sms', 'send_email'],
      popularity: 88,
      estimated_engagement: '72%',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'missed-call-response',
      name: 'Missed Call Auto-Response',
      description: 'Instantly respond to missed calls with SMS containing availability and booking link',
      category: 'calls',
      icon: <Phone className="w-5 h-5" />,
      triggers: ['missed_call'],
      actions: ['send_sms'],
      popularity: 92,
      estimated_engagement: '68%',
      color: 'from-purple-500 to-violet-500'
    },
    {
      id: 'invoice-overdue',
      name: 'Overdue Invoice Alerts',
      description: 'Automated payment reminders for overdue invoices with escalating urgency',
      category: 'billing',
      icon: <DollarSign className="w-5 h-5" />,
      triggers: ['invoice_overdue'],
      actions: ['send_email', 'send_sms'],
      popularity: 78,
      estimated_engagement: '45%',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'seasonal-maintenance',
      name: 'Seasonal Maintenance Campaign',
      description: 'Reach out to past customers with seasonal maintenance offers and discounts',
      category: 'marketing',
      icon: <TrendingUp className="w-5 h-5" />,
      triggers: ['schedule'],
      actions: ['send_email', 'send_sms'],
      popularity: 65,
      estimated_engagement: '35%',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'estimate-follow-up',
      name: 'Estimate Follow-up',
      description: 'Follow up on pending estimates with additional information and incentives',
      category: 'sales',
      icon: <Mail className="w-5 h-5" />,
      triggers: ['estimate_sent'],
      actions: ['send_email'],
      popularity: 82,
      estimated_engagement: '58%',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  const getPopularityBadge = (popularity: number) => {
    if (popularity >= 90) return { text: 'Most Popular', color: 'bg-green-100 text-green-700' };
    if (popularity >= 80) return { text: 'Popular', color: 'bg-blue-100 text-blue-700' };
    if (popularity >= 70) return { text: 'Trending', color: 'bg-purple-100 text-purple-700' };
    return { text: 'New', color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Automation Templates
              </h2>
              <p className="text-gray-600">Pre-built workflows optimized for your business</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{templates.length}</div>
              <div className="text-sm text-gray-600">Templates Available</div>
            </div>
            <div className="p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">5 min</div>
              <div className="text-sm text-gray-600">Setup Time</div>
            </div>
            <div className="p-3 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-green-600">AI-Powered</div>
              <div className="text-sm text-gray-600">Smart Optimization</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const popularityBadge = getPopularityBadge(template.popularity);
          
          return (
            <Card 
              key={template.id} 
              className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white overflow-hidden"
            >
              {/* Gradient Header */}
              <div className={`h-2 bg-gradient-to-r ${template.color}`} />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 bg-gradient-to-r ${template.color} rounded-xl text-white shadow-lg`}>
                      {template.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {template.name}
                      </CardTitle>
                      <Badge className={popularityBadge.color}>
                        {popularityBadge.text}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{(template.popularity / 20).toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {template.description}
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-sm font-semibold text-blue-600">{template.estimated_engagement}</div>
                    <div className="text-xs text-blue-600">Engagement</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-sm font-semibold text-green-600">{template.popularity}%</div>
                    <div className="text-xs text-green-600">Popularity</div>
                  </div>
                </div>
                
                {/* Actions & Triggers */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {template.triggers.length} trigger{template.triggers.length !== 1 ? 's' : ''}, {template.actions.length} action{template.actions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => onCreateFromTemplate(template.id)}
                  className={`w-full bg-gradient-to-r ${template.color} hover:opacity-90 text-white font-medium transition-all duration-300 transform hover:scale-105`}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
