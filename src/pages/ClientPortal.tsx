
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import EnhancedClientPortal from "./EnhancedClientPortal";

export default function ClientPortal() {
  const { accessId } = useParams();
  
  useEffect(() => {
    // Check if we're on the portal domain
    const currentDomain = window.location.hostname;
    const isPortalDomain = currentDomain === 'portal.fixlify.app' || 
                          currentDomain === 'localhost' || 
                          currentDomain.includes('portal');
    
    console.log('Client Portal accessed from domain:', currentDomain);
    console.log('Is portal domain:', isPortalDomain);
  }, []);

  // Always use the enhanced portal for better functionality
  return <EnhancedClientPortal />;
}
