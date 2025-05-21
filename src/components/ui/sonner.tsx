
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group fixed top-[15%]"
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
        duration: 5000,
      }}
      {...props}
    />
  )
}

// Enhanced toast with success and error variations
const enhancedToast = {
  success: (message: string, options?: Parameters<typeof toast>[1]) => 
    toast.success(message, {
      ...options,
      className: "success-toast toast-center",
      style: {
        ...options?.style,
      }
    }),
  error: (message: string, options?: Parameters<typeof toast>[1]) => 
    toast.error(message, {
      ...options,
      className: "error-toast toast-center",
      style: {
        ...options?.style,
      }
    })
}

export { Toaster, toast, enhancedToast }
