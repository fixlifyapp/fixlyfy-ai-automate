
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
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg relative",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group toast group-[.toaster]:bg-green-50 group-[.toaster]:text-green-800 group-[.toaster]:border-green-200",
          error:
            "group toast group-[.toaster]:bg-red-50 group-[.toaster]:text-red-800 group-[.toaster]:border-red-200",
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
      style: {
        ...options?.style,
        backgroundColor: '#F2FCE2', 
        color: '#3A7613',
        border: '1px solid #BDE99F'
      }
    }),
  error: (message: string, options?: Parameters<typeof toast>[1]) => 
    toast.error(message, {
      ...options,
      style: {
        ...options?.style,
        backgroundColor: '#FEECEE', 
        color: '#ea384c',
        border: '1px solid #FAC6CC'
      }
    })
}

export { Toaster, toast, enhancedToast }
