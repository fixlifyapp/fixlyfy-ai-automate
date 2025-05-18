
import { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SearchDialog } from '@/components/jobs/dialogs/SearchDialog';
import { UserRoleSwitcher } from '@/components/auth/UserRoleSwitcher';

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  return (
    <header className="border-b border-fixlyfy-border bg-fixlyfy-bg-interface py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center max-w-md w-full">
          <div className="relative w-full mr-2">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-secondary"
            />
            <Input 
              placeholder="Search..." 
              className="pl-10 border-fixlyfy-border" 
              onClick={() => setIsSearchOpen(true)}
              readOnly
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} className="text-fixlyfy-text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-fixlyfy animate-pulse"></span>
          </Button>
          
          <UserRoleSwitcher />
        </div>
      </div>
      
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
};
