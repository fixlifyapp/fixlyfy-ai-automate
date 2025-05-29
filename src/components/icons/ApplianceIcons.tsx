
import React from "react";
import { ThreeDIcon } from "@/components/ui/3d-icon";

interface ApplianceIconProps {
  size?: number;
  className?: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  is3D?: boolean;
  animated?: boolean;
  [key: string]: any;
}

export const DryerIcon: React.FC<ApplianceIconProps> = ({ 
  size = 24, 
  className = "", 
  variant = "primary",
  is3D = false,
  animated = false,
  ...props 
}) => {
  const IconComponent = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-dryer ${className}`}
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
      <path d="M5 5h2" />
      <path d="M5 9h1" />
    </svg>
  );

  if (is3D) {
    return (
      <ThreeDIcon 
        icon={IconComponent as any}
        variant={variant}
        animated={animated}
      />
    );
  }

  return <IconComponent />;
};

export const DishwasherIcon: React.FC<ApplianceIconProps> = ({ 
  size = 24, 
  className = "", 
  variant = "primary",
  is3D = false,
  animated = false,
  ...props 
}) => {
  const IconComponent = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-dishwasher ${className}`}
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M5 7h14" />
      <path d="M5 17h14" />
      <path d="M7 12h1" />
      <path d="M16 12h1" />
    </svg>
  );

  if (is3D) {
    return (
      <ThreeDIcon 
        icon={IconComponent as any}
        variant={variant}
        animated={animated}
      />
    );
  }

  return <IconComponent />;
};

export const FridgeIcon: React.FC<ApplianceIconProps> = ({ 
  size = 24, 
  className = "", 
  variant = "primary",
  is3D = false,
  animated = false,
  ...props 
}) => {
  const IconComponent = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-fridge ${className}`}
      {...props}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <path d="M5 10h14" />
      <path d="M8 6h.01" />
      <path d="M8 14h.01" />
    </svg>
  );

  if (is3D) {
    return (
      <ThreeDIcon 
        icon={IconComponent as any}
        variant={variant}
        animated={animated}
      />
    );
  }

  return <IconComponent />;
};

export const WasherIcon: React.FC<ApplianceIconProps> = ({ 
  size = 24, 
  className = "", 
  variant = "primary",
  is3D = false,
  animated = false,
  ...props 
}) => {
  const IconComponent = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-washer ${className}`}
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M4 4h.01" />
      <path d="M7 4h.01" />
    </svg>
  );

  if (is3D) {
    return (
      <ThreeDIcon 
        icon={IconComponent as any}
        variant={variant}
        animated={animated}
      />
    );
  }

  return <IconComponent />;
};
