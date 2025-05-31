
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenu } from '@/components/auth/UserMenu';
import { HeaderSearch } from './HeaderSearch';
import { NotificationsBell } from './NotificationsBell';

export const Header = () => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="border-b bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showSearch && (
          <div className="flex-1 max-w-md mx-4">
            <HeaderSearch />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <NotificationsBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
