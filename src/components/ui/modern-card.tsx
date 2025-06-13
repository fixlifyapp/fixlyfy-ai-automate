
import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const modernCardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1",
  {
    variants: {
      variant: {
        default: "border-border bg-gradient-to-br from-card to-card/90",
        elevated: "shadow-2xl hover:shadow-3xl bg-gradient-to-br from-white to-gray-50/80",
        interactive: "hover:shadow-2xl cursor-pointer hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50/30",
        ghost: "border-transparent shadow-none hover:shadow-lg bg-gradient-to-br from-transparent to-gray-50/20",
        glass: "backdrop-blur-sm bg-white/20 border-white/30 shadow-xl hover:bg-white/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ModernCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modernCardVariants> {
  onClick?: () => void;
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant, onClick, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(modernCardVariants({ variant, className }))}
      onClick={onClick}
      {...props}
    />
  )
)
ModernCard.displayName = "ModernCard"

const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-transparent to-white/20 rounded-t-xl", className)}
    {...props}
  />
))
ModernCardHeader.displayName = "ModernCardHeader"

const ModernCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
))
ModernCardTitle.displayName = "ModernCardTitle"

const ModernCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground/80", className)}
    {...props}
  />
))
ModernCardDescription.displayName = "ModernCardDescription"

const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
ModernCardContent.displayName = "ModernCardContent"

const ModernCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 bg-gradient-to-r from-transparent to-gray-50/30 rounded-b-xl", className)}
    {...props}
  />
))
ModernCardFooter.displayName = "ModernCardFooter"

export { ModernCard, ModernCardHeader, ModernCardFooter, ModernCardTitle, ModernCardDescription, ModernCardContent }
