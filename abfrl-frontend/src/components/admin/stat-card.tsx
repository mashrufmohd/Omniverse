'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  className 
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wide">
          {title}
        </CardTitle>
        {Icon && (
          <div className="h-8 w-8 flex items-center justify-center bg-primary/10 border-2 border-border">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-mono">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            {trend && (
              <span className={cn(
                "font-bold",
                trend.isPositive ? "text-secondary" : "text-primary"
              )}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
