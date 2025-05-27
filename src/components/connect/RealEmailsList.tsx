
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Reply, Star, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Email {
  id: string;
  email_address: string;
  subject: string;
  body: string;
  direction: string;
  status: string;
  is_read: boolean;
  is_starred: boolean;
  created_at: string;
  clients?: {
    id: string;
    name: string;
    email: string;
  };
}

export const RealEmailsList = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  useEffect(() => {
    loadEmails();
    
    // Set up real-time subscription for new emails
    const channel = supabase
      .channel('emails-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emails'
        },
        () => {
          loadEmails(); // Reload emails when there are changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          clients:client_id(id, name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    switch (filter) {
      case 'unread': return !email.is_read;
      case 'starred': return email.is_starred;
      default: return true;
    }
  });

  const markAsRead = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', emailId);

      if (error) throw error;
      loadEmails();
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  const toggleStar = async (emailId: string, isStarred: boolean) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_starred: !isStarred })
        .eq('id', emailId);

      if (error) throw error;
      loadEmails();
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'inbound' ? 
      <Mail className="h-4 w-4 text-blue-600" /> : 
      <Reply className="h-4 w-4 text-green-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'failed': return 'destructive';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading emails...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Management ({filteredEmails.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({emails.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({emails.filter(e => !e.is_read).length})
            </Button>
            <Button
              variant={filter === 'starred' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('starred')}
            >
              Starred ({emails.filter(e => e.is_starred).length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEmails.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No emails yet' : `No ${filter} emails`}
              </h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'Email communications will appear here.'
                  : `No ${filter} emails found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                    !email.is_read ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => !email.is_read && markAsRead(email.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {getDirectionIcon(email.direction)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${!email.is_read ? 'font-bold' : ''}`}>
                            {email.clients?.name || 'Unknown Client'}
                          </span>
                          <Badge variant={getStatusColor(email.status) as any}>
                            {email.status}
                          </Badge>
                          {!email.is_read && (
                            <Badge variant="info">New</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-1">
                          {email.email_address}
                        </div>
                        
                        <div className={`text-sm mb-2 ${!email.is_read ? 'font-semibold' : ''}`}>
                          {email.subject}
                        </div>
                        
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {email.body}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(email.created_at).toLocaleString()}
                          </span>
                          <span className="capitalize">{email.direction}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(email.id, email.is_starred);
                        }}
                      >
                        <Star 
                          className={`h-4 w-4 ${
                            email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                          }`} 
                        />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement reply functionality
                        }}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
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
