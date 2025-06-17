
import { useClientPortal } from './ClientPortalProvider';
import { MobileClientPortal } from './MobileClientPortal';
import { useEffect, useState } from 'react';

export function ModernClientPortal() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Always use mobile version for better experience
  return <MobileClientPortal />;
}
