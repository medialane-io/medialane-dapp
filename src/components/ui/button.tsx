import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-m3-full text-sm font-medium transition-all duration-m3-medium ease-m3-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-m3-primary text-m3-on-primary shadow-m3-1 hover:shadow-m3-2 hover:bg-m3-primary/90 active:bg-m3-primary/85",
        destructive:
          "bg-m3-error text-m3-on-error shadow-m3-1 hover:shadow-m3-2 hover:bg-m3-error/90 active:bg-m3-error/85",
        outline:
          "border border-m3-outline text-m3-primary bg-transparent hover:bg-m3-primary/8 active:bg-m3-primary/12",
        secondary:
          "bg-m3-secondary-container text-m3-on-secondary-container shadow-m3-1 hover:shadow-m3-2 hover:bg-m3-secondary-container/90",
        tonal:
          "bg-m3-tertiary-container text-m3-on-tertiary-container shadow-m3-1 hover:shadow-m3-2 hover:bg-m3-tertiary-container/90",
        ghost:
          "text-m3-on-surface hover:bg-m3-on-surface/8 active:bg-m3-on-surface/12",
        link:
          "text-m3-primary underline-offset-4 hover:underline transition-colors",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
