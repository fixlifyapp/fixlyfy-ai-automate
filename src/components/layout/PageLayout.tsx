
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-6'}`}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
            className="mb-4 gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          {children}
        </main>
      </div>
    </div>
  );
};
