import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"

interface KPICardProps extends React.ComponentProps<"div"> {
  title: string
  value: string | number
  delta?: {
    value: string
    trend: "up" | "down" | "neutral"
  }
  description?: string
  icon?: React.ReactNode
  loading?: boolean
}

function KPICard({ 
  className, 
  title, 
  value, 
  delta, 
  description, 
  icon,
  loading = false,
  ...props 
}: KPICardProps) {
  return (
    <Card className={cn("", className)} {...props}>
      <CardContent className="flex flex-col gap-4">
        {/* Header with title and icon */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>

        {/* Main value */}
        <div className="text-3xl font-bold tracking-tight">
          {loading ? (
            <div className="h-8 w-24 bg-muted/20 rounded animate-pulse" />
          ) : (
            value
          )}
        </div>

        {/* Delta indicator */}
        {delta && !loading && (
          <div className={cn(
            "inline-flex items-center gap-1 text-sm font-medium",
            delta.trend === "up" && "text-green-600",
            delta.trend === "down" && "text-red-600",
            delta.trend === "neutral" && "text-muted-foreground"
          )}>
            {delta.trend === "up" && "▲"}
            {delta.trend === "down" && "▼"}
            {delta.trend === "neutral" && "●"}
            <span>{delta.value}</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface MetricCardProps extends React.ComponentProps<"div"> {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    direction: "up" | "down" | "neutral"
    period?: string
  }
  icon?: React.ReactNode
  loading?: boolean
}

function MetricCard({ 
  className, 
  title, 
  value, 
  subtitle, 
  trend, 
  icon,
  loading = false,
  ...props 
}: MetricCardProps) {
  return (
    <Card className={cn("", className)} {...props}>
      <CardContent className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="text-2xl font-bold tracking-tight">
          {loading ? (
            <div className="h-6 w-20 bg-muted/20 rounded animate-pulse" />
          ) : (
            value
          )}
        </div>

        {/* Subtitle and trend */}
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && !loading && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              trend.direction === "up" && "text-green-600",
              trend.direction === "down" && "text-red-600",
              trend.direction === "neutral" && "text-muted-foreground"
            )}>
              {trend.direction === "up" && "▲"}
              {trend.direction === "down" && "▼"}
              {trend.direction === "neutral" && "●"}
              <span>{trend.value}</span>
              {trend.period && <span className="ml-1">({trend.period})</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { KPICard, MetricCard }
