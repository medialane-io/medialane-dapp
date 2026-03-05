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
          "bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 active:bg-blue-800",
        destructive:
          "bg-red-500 text-white shadow-[0_4px_14px_rgba(239,68,68,0.4)] hover:bg-red-600 hover:shadow-[0_6px_20px_rgba(239,68,68,0.6)] hover:-translate-y-0.5 active:bg-red-700",
        outline:
          "border-[1.5px] border-blue-600/30 text-blue-600 dark:text-blue-400 bg-transparent hover:border-blue-600 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)] active:bg-blue-600/10",
        secondary:
          "bg-[rgb(18,33,61)] text-white shadow-[0_4px_14px_rgba(18,33,61,0.4)] hover:bg-[#1A2D52] hover:shadow-[0_6px_20px_rgba(18,33,61,0.6)] hover:-translate-y-0.5 active:bg-[#0D182E]",
        tonal:
          "bg-[rgb(18,33,61)]/5 dark:bg-[rgb(18,33,61)]/40 text-[rgb(18,33,61)] dark:text-white hover:bg-[rgb(18,33,61)]/10 dark:hover:bg-[rgb(18,33,61)]/60 active:bg-[rgb(18,33,61)]/20",
        ghost:
          "text-[rgb(18,33,61)] dark:text-white hover:bg-[rgb(18,33,61)]/5 dark:hover:bg-[rgb(18,33,61)]/20 active:bg-[rgb(18,33,61)]/10 font-bold",
        link:
          "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline transition-colors",
        premium:
          "bg-orange-500 text-white shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:bg-orange-600 hover:shadow-[0_8px_30px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 border border-white/20",
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
