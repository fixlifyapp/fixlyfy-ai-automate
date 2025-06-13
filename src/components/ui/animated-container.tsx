
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-in' | 'slide-up' | 'scale-in';
}

export const AnimatedContainer = ({ 
  children, 
  className,
  delay = 0,
  animation = 'fade-in'
}: AnimatedContainerProps) => {
  return (
    <div
      className={cn(
        "animate-fade-in",
        animation === 'slide-up' && "animate-slide-up",
        animation === 'scale-in' && "animate-scale-in",
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
};
