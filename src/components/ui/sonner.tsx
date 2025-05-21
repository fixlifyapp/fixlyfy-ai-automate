
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

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

// Enhanced toast with success and error variations
// These are no-op (empty) implementations to silence notifications
const enhancedToast = {
  success: (message: string) => {
    console.log('Toast success (silenced):', message);
    return { id: '', dismiss: () => {} };
  },
  error: (message: string) => {
    console.log('Toast error (silenced):', message);
    return { id: '', dismiss: () => {} };
  }
}

// Override the default toast function to be a no-op
const toast = Object.assign(
  (message: any) => {
    console.log('Toast (silenced):', message);
    return { id: '', dismiss: () => {} };
  },
  {
    success: (message: string) => {
      console.log('Toast success (silenced):', message);
      return { id: '', dismiss: () => {} };
    },
    error: (message: string) => {
      console.log('Toast error (silenced):', message);
      return { id: '', dismiss: () => {} };
    },
    info: () => ({ id: '', dismiss: () => {} }),
    warning: () => ({ id: '', dismiss: () => {} }),
    custom: () => ({ id: '', dismiss: () => {} }),
    promise: () => ({ id: '', dismiss: () => {} }),
    dismiss: () => {},
    update: () => {},
    getHistory: () => []
  }
);

export { Toaster, toast, enhancedToast }
