import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface NavigationItemProps extends React.ComponentProps<"button"> {
  icon?: React.ReactNode
  label: string
  isActive?: boolean
  badge?: string | number
  href?: string
}

function NavigationItem({ 
  className, 
  icon, 
  label, 
  isActive = false, 
  badge,
  href,
  ...props 
}: NavigationItemProps) {
  const Component = href ? "a" : "button"
  
  return (
    <Component
      className={cn(
        "nav-item-modern w-full group",
        isActive && "active",
        className
      )}
      href={href}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
          {icon}
        </span>
      )}
      <span className="flex-1 text-left font-medium">{label}</span>
      {badge && (
        <span className="badge-status badge-muted animate-pulse">
          {badge}
        </span>
      )}
    </Component>
  )
}

interface NavigationGroupProps extends React.ComponentProps<"div"> {
  title?: string
  children: React.ReactNode
}

function NavigationGroup({ className, title, children, ...props }: NavigationGroupProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {title && (
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-border/20">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}

interface NavigationProps extends React.ComponentProps<"nav"> {
  children: React.ReactNode
}

function Navigation({ className, children, ...props }: NavigationProps) {
  return (
    <nav className={cn("space-y-8", className)} {...props}>
      {children}
    </nav>
  )
}

export { Navigation, NavigationGroup, NavigationItem }

