import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:scale-105",
        secondary:
          "bg-secondary/10 text-secondary-foreground border border-secondary/20 hover:bg-secondary/20 hover:scale-105",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:scale-105",
        outline:
          "border border-border text-foreground hover:bg-muted/50 hover:scale-105",
        success:
          "bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 hover:scale-105",
        warning:
          "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20 hover:scale-105",
        info:
          "bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 hover:scale-105",
        muted:
          "bg-muted/10 text-muted-foreground border border-muted/20 hover:bg-muted/20 hover:scale-105",
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
