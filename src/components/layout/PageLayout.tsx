
import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  SidebarProvider,
  SidebarInset
} from '@/components/ui/sidebar';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className={`flex-1 overflow-y-auto ${isMobile ? 'p-2 pb-safe' : 'p-6'}`}>
            <div className={`flex items-center gap-2 mb-4 ${isMobile ? 'sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2' : ''}`}>
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "sm"}
                onClick={handleBack}
                className={`gap-2 ${isMobile ? 'px-2 py-1 h-8' : ''}`}
              >
                <ArrowLeft size={isMobile ? 14 : 16} />
                <span className={isMobile ? 'hidden xs:inline' : ''}>Back</span>
              </Button>
            </div>
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
