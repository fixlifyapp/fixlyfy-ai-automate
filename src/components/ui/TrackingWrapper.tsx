
import { ReactNode, cloneElement, isValidElement } from 'react';
import { useUserTracking } from '@/hooks/useUserTracking';

interface TrackingWrapperProps {
  children: ReactNode;
  actionType: string;
  element?: string;
  context?: Record<string, any>;
}

export const TrackingWrapper = ({ 
  children, 
  actionType, 
  element, 
  context = {} 
}: TrackingWrapperProps) => {
  const { trackAction } = useUserTracking();

  const handleClick = (originalOnClick?: () => void) => {
    trackAction({
      actionType,
      element,
      context
    });
    
    if (originalOnClick) {
      originalOnClick();
    }
  };

  if (isValidElement(children)) {
    return cloneElement(children, {
      onClick: () => handleClick(children.props.onClick)
    });
  }

  return <>{children}</>;
};
