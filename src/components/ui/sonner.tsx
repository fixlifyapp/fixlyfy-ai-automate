
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group toast success-toast",
          error:
            "group toast error-toast",
        },
        duration: 4000, // 4 seconds
      }}
      {...props}
    />
  )
}

// Enhanced toast with error throttling
const lastErrorTime = new Map<string, number>();
const ERROR_THROTTLE_MS = 30000; // 30 seconds

const customToast = {
  success: (message: string | React.ReactNode, options?: any) => {
    return import('sonner').then(({ toast }) => toast.success(message, options));
  },
  error: (message: string | React.ReactNode, options?: any) => {
    const messageKey = typeof message === 'string' ? message : 'error';
    const now = Date.now();
    
    // Throttle duplicate errors
    if (lastErrorTime.has(messageKey)) {
      const lastTime = lastErrorTime.get(messageKey)!;
      if (now - lastTime < ERROR_THROTTLE_MS) {
        return { id: '', dismiss: () => {} };
      }
    }
    
    lastErrorTime.set(messageKey, now);
    
    return import('sonner').then(({ toast }) => toast.error(message, {
      ...options,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    }));
  },
  info: (message: string | React.ReactNode, options?: any) => {
    return import('sonner').then(({ toast }) => toast.info(message, options));
  },
  warning: (message: string | React.ReactNode, options?: any) => {
    return import('sonner').then(({ toast }) => toast.warning(message, options));
  }
}

// Create enhanced toast function
export { Toaster }
export const toast = Object.assign(
  (message: string | React.ReactNode) => customToast.info(message),
  customToast
);

export const enhancedToast = toast;
