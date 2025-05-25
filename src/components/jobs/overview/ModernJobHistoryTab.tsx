
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Calendar, User, MessageSquare, Clock, Activity, FileText, DollarSign, Wrench, Phone, Search, Filter } from "lucide-react";
import { useEnhancedJobHistory } from "@/hooks/useEnhancedJobHistory";
import { formatDistanceToNow } from "date-fns";

interface ModernJobHistoryTabProps {
  jobId: string;
}

export const ModernJobHistoryTab = ({ jobId }: ModernJobHistoryTabProps) => {
  const { historyItems, isLoading, canViewItem } = useEnhancedJobHistory(jobId);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterUser, setFilterUser] = useState("all");

  // Filter items that the current user can view
  const visibleItems = historyItems.filter(canViewItem);

  // Apply search and filters
  const filteredItems = visibleItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesUser = filterUser === "all" || item.user_name === filterUser;
    
    return matchesSearch && matchesType && matchesUser;
  });

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(visibleItems.map(item => item.user_name).filter(Boolean)));

  // Get unique types for filter
  const uniqueTypes = Array.from(new Set(visibleItems.map(item => item.type)));

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'status-change':
      case 'status_change':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'payment':
      case 'payment-recorded':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'note':
      case 'user-action':
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      case 'estimate':
      case 'estimate-created':
      case 'estimate-updated':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'invoice':
      case 'invoice-created':
      case 'invoice-updated':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'technician':
      case 'technician-assigned':
        return <Wrench className="h-4 w-4 text-blue-600" />;
      case 'communication':
        return <Phone className="h-4 w-4 text-indigo-500" />;
      case 'attachment':
        return <FileText className="h-4 w-4 text-gray-600" />;
      case 'navigation':
        return <Activity className="h-4 w-4 text-gray-400" />;
      case 'form-interaction':
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getHistoryTypeColor = (type: string) => {
    switch (type) {
      case 'status-change':
      case 'status_change':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'payment':
      case 'payment-recorded':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'note':
      case 'user-action':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'estimate':
      case 'estimate-created':
      case 'estimate-updated':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'invoice':
      case 'invoice-created':
      case 'invoice-updated':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'technician':
      case 'technician-assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'communication':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'attachment':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'navigation':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'form-interaction':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatType = (type: string) => {
    return type.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <ModernCardTitle icon={History}>
            Job History ({filteredItems.length} of {visibleItems.length})
          </ModernCardTitle>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {formatType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-full sm:w-48">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user || ''}>
                    {user || 'System'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="w-full h-16" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">
                {searchTerm || filterType !== "all" || filterUser !== "all" 
                  ? "No matching history found" 
                  : "No history available"
                }
              </p>
              <p className="text-sm">
                {searchTerm || filterType !== "all" || filterUser !== "all"
                  ? "Try adjusting your search or filters"
                  : "Job activity will appear here as it happens"
                }
              </p>
              {(searchTerm || filterType !== "all" || filterUser !== "all") && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterUser("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* Timeline line */}
                  {index < filteredItems.length - 1 && (
                    <div className="absolute left-6 top-8 bottom-0 w-px bg-gray-200" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                      {getHistoryIcon(item.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="bg-gray-50 rounded-lg p-4 border hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              <Badge 
                                variant="outline" 
                                className={getHistoryTypeColor(item.type)}
                              >
                                {formatType(item.type)}
                              </Badge>
                              {item.entity_type && (
                                <Badge variant="outline" className="text-xs">
                                  {item.entity_type}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-700 mb-2">{item.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                              </div>
                              {item.user_name && (
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {item.user_name}
                                </div>
                              )}
                              {item.meta && Object.keys(item.meta).length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  +{Object.keys(item.meta).length} details
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};
