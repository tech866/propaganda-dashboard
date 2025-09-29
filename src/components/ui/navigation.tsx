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
        "nav-item-modern w-full",
        isActive && "active",
        className
      )}
      href={href}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="badge-status badge-muted">
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
    <div className={cn("space-y-1", className)} {...props}>
      {title && (
        <h3 className="text-caption font-medium text-muted-foreground px-4 py-2">
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
    <nav className={cn("space-y-6", className)} {...props}>
      {children}
    </nav>
  )
}

export { Navigation, NavigationGroup, NavigationItem }
