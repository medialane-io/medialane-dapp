"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { M3_SQUISH_TAP, M3_SPRING_SNAPPY } from "@/lib/m3-motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-m3-full text-sm font-medium transition-colors duration-m3-short ease-m3-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-m3-1 hover:shadow-glow-blue hover:bg-blue-700 active:bg-blue-800 transition-all duration-300",
        destructive:
          "bg-m3-error text-m3-on-error shadow-m3-1 hover:bg-m3-error/90 active:bg-m3-error/80",
        outline:
          "border-[1.5px] border-blue-600/30 text-blue-600 dark:text-blue-400 bg-transparent hover:border-blue-600 hover:bg-blue-600/5 active:bg-blue-600/10",
        secondary:
          "bg-m3-secondary text-m3-on-secondary shadow-m3-1 hover:bg-m3-secondary/90 active:bg-m3-secondary/80",
        tonal:
          "bg-m3-secondary-container text-m3-on-secondary-container hover:bg-m3-secondary-container/80 active:bg-m3-secondary-container/60",
        ghost:
          "text-m3-on-surface hover:bg-m3-surface-container-high active:bg-m3-surface-container-highest font-bold",
        link:
          "text-m3-primary underline-offset-4 hover:underline transition-colors",
        premium:
          "bg-m3-tertiary text-m3-on-tertiary shadow-m3-2 hover:shadow-glow-mauve hover:bg-m3-tertiary/90 border border-foreground/20 transition-all duration-300",
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
    // If it's a Slot, we don't apply motion directly to avoid breaking child refs.
    // If it's a standard button, we use motion.button for squish-and-stretch.
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      )
    }

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileTap={variant !== "link" && variant !== "ghost" ? M3_SQUISH_TAP : { scale: 0.97 }}
        transition={M3_SPRING_SNAPPY}
        {...props as any}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
