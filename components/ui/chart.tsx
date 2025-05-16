"use client"

import * as React from "react"
import {
  Legend,
  Tooltip,
  TooltipProps,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"
import { type LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

interface ChartCardProps {
  title?: string
  description?: string
  data: any[]
  type?: "bar" | "line" | "pie"
}

const COLORS = [
  "rgba(255, 255, 255, 0.95)", // 纯白
  "rgba(255, 255, 255, 0.8)",  // 浅灰白
  "rgba(255, 255, 255, 0.65)", // 中灰白
  "rgba(255, 255, 255, 0.5)",  // 深灰白
  "rgba(255, 255, 255, 0.35)", // 更深灰白
  "rgba(255, 255, 255, 0.2)",  // 最深灰白
]

export function ChartCard({ title, description, data, type = "bar" }: ChartCardProps) {
  // 计算最大值用于颜色映射
  const maxValue = Math.max(...data.map(item => item.value))
  
  // 计算总和用于饼图占比
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // 根据数值大小或占比计算颜色深浅
  const getColor = (value: number, isPercentage = false) => {
    const opacity = isPercentage 
      ? value / total  // 饼图用占比
      : value / maxValue  // 柱状图用数值比
    // 提高基础透明度到 0.5，减小变化范围到 0.4，使颜色变化更加平缓
    const mappedOpacity = 0.5 + (opacity * 0.4)
    return `rgba(255, 255, 255, ${mappedOpacity.toFixed(2)})`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      const percentage = ((value / total) * 100).toFixed(1)
      
      return (
        <div className="rounded-lg border bg-zinc-900/95 p-3 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-200">
              {label || payload[0].name}
            </span>
            <div className="flex items-center gap-2">
              <div 
                className="h-2 w-2 rounded-full"
                style={{ background: payload[0].color }}
              />
              <span className="text-sm font-semibold text-white">
                {value} ({percentage}%)
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "pie" ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColor(entry.value, true)}
                      className="stroke-zinc-900 hover:opacity-90 transition-opacity duration-200"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip />}
                  wrapperStyle={{ outline: "none" }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-sm font-medium text-zinc-300">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            ) : type === "bar" ? (
              <BarChart 
                data={data} 
                margin={{ top: 10, right: 25, left: 20, bottom: 25 }}
                barGap={8}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  className="stroke-zinc-800" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                  dy={8}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#a1a1aa" }}
                  dx={-10}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                  wrapperStyle={{ outline: "none" }}
                />
                <Bar 
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={getColor(entry.value, false)}
                      className="hover:opacity-90 transition-opacity duration-200 drop-shadow-lg"
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : null}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 