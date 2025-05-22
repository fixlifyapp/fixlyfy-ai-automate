import { useState } from 'react';
import { Menu, Bell, Search, AlertTriangle, Lightbulb, MessageSquareWarning, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SearchDialog } from '@/components/jobs/dialogs/SearchDialog';
import { UserRoleSwitcher } from '@/components/auth/UserRoleSwitcher';
import { UserMenu } from '@/components/auth/UserMenu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

type NotificationType = 'ai-insight' | 'error' | 'warning' | 'success' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Sample notifications - in a real app these would come from a store/context
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'ai-insight',
    title: 'Schedule Optimization',
    message: 'Your technicians have 3 overlapping appointments tomorrow. AI suggests rescheduling Job #1242.',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'error',
    title: 'Invoice Generation Failed',
    message: 'Unable to generate invoice for Job #1532. Please check client details.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Low Inventory Alert',
    message: 'HVAC filters (part #A-2234) are running low. Only 5 units remaining.',
    time: '3 hours ago',
    read: false,
  },
  {
    id: '4',
    type: 'success',
    title: 'Payment Received',
    message: 'Client Smith has paid invoice #INV-2022-004 for $1,245.00.',
    time: 'Yesterday',
    read: true,
  }
];

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { toast } = useToast();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    toast({
      title: "All notifications marked as read",
      duration: 2000,
    });
  };
  
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'ai-insight':
        return <Lightbulb size={16} className="text-fixlyfy" />;
      case 'error':
        return <MessageSquareWarning size={16} className="text-fixlyfy-danger" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-fixlyfy-warning" />;
      case 'success':
        return <Check size={16} className="text-fixlyfy-success" />;
      default:
        return <Bell size={16} className="text-fixlyfy-text-secondary" />;
    }
  };
  
  return (
    <header className="border-b border-fixlify-border bg-fixlify-bg-interface py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center max-w-md w-full">
          <div className="relative w-full mr-2">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlify-text-secondary"
            />
            <Input 
              placeholder="Search..." 
              className="pl-10 border-fixlify-border" 
              onClick={() => setIsSearchOpen(true)}
              readOnly
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} className="text-fixlify-text-secondary" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 rounded-full bg-fixlify text-white text-xs">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="flex items-center justify-between p-4 bg-fixlify-bg-interface">
                <h3 className="font-medium">Notifications</h3>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <Separator />
              <ScrollArea className="h-[300px]">
                {notifications.length > 0 ? (
                  <div>
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "p-4 border-b border-fixlify-border last:border-b-0 relative hover:bg-fixlify-bg-interface/50",
                          !notification.read && "bg-fixlify-bg-interface/20"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-medium">{notification.title}</h4>
                              <span className="text-xs text-fixlify-text-secondary">{notification.time}</span>
                            </div>
                            <p className="text-sm text-fixlify-text-secondary mt-1">{notification.message}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                        {!notification.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-fixlify"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-fixlify-text-secondary">
                    <Bell className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    <p>No notifications</p>
                    <p className="text-sm mt-1">You're all caught up!</p>
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
          
          {/* Replace UserRoleSwitcher with UserMenu */}
          <UserMenu />
        </div>
      </div>
      
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
};
