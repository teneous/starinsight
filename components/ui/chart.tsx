"use client"

import * as React from "react"
import {
  Legend,
  Tooltip,
  TooltipProps,
} from "recharts"
import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type ChartColor = string | { light: string; dark: string }

export type ChartConfig = Record<
  string,
  {
    label: string
    color: ChartColor
    icon?: LucideIcon
  }
>

interface ChartRootProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  className,
  children,
  config,
  ...props
}: ChartRootProps) {
  const style = React.useMemo(() => {
    return Object.entries(config).reduce(
      (styles, [key, value]) => {
        if (value.color) {
          styles[`--color-${key}`] = typeof value.color === "string" ? value.color : value.color.light
        }
        return styles
      },
      {} as Record<string, string>
    )
  }, [config])

  return (
    <div
      style={style}
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function ChartTooltip(props: TooltipProps<any, any>) {
  return <Tooltip {...props} cursor={false} />
}

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function ChartTooltipContent({
  className,
  ...props
}: TooltipContentProps) {
  return (
    <div
      className={cn(
        "rounded-md border bg-background p-2.5 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export function ChartLegend(props: any) {
  return (
    <Legend
      {...props}
      layout="horizontal"
      verticalAlign="bottom"
      align="center"
    />
  )
}

interface LegendContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function ChartLegendContent({
  className,
  ...props
}: LegendContentProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-4",
        className
      )}
      {...props}
    />
  )
} 