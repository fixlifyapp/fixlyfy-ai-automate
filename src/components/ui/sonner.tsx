
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as sonnerToast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group hidden" // Hide all toasts
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg relative toast-center",
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
        duration: 0, // Set to 0 to disable automatic dismissal
      }}
      {...props}
    />
  )
}

// Updated type definitions for the toast override
const customToast = {
  success: (message: string | React.ReactNode, options?: any) => {
    // No-op implementation to silence notifications
    return { id: '', dismiss: () => {} };
  },
  error: (message: string | React.ReactNode, options?: any) => {
    // No-op implementation to silence notifications
    return { id: '', dismiss: () => {} };
  },
  info: (message: string | React.ReactNode, options?: any) => {
    // No-op implementation to silence notifications
    return { id: '', dismiss: () => {} };
  },
  warning: (message: string | React.ReactNode, options?: any) => {
    // No-op implementation to silence notifications
    return { id: '', dismiss: () => {} };
  }
}

// Override the default toast function with properly typed no-op functions
export { Toaster }
export const toast = Object.assign(
  (message: string | React.ReactNode) => ({ id: '', dismiss: () => {} }),
  {
    ...sonnerToast,
    ...customToast,
    dismiss: () => {},
    update: () => {},
  }
);

// Export a renamed version for external components to use
export const enhancedToast = toast;
