import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "badge-status inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border-primary/20 [a&]:hover:bg-primary/20",
        secondary:
          "bg-secondary/10 text-secondary-foreground border-secondary/20 [a&]:hover:bg-secondary/20",
        destructive:
          "badge-destructive [a&]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a&]:hover:bg-muted/50",
        success:
          "badge-success [a&]:hover:bg-success/20",
        warning:
          "badge-warning [a&]:hover:bg-warning/20",
        info:
          "badge-info [a&]:hover:bg-info/20",
        muted:
          "badge-muted [a&]:hover:bg-muted/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
