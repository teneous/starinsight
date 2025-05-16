'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartCard } from '@/components/ui/chart'
import { Filter, HardDrive, Languages } from 'lucide-react'

// Define data structure
interface AnalyticsData {
  languageData: Array<{ name: string; value: number }>;
  starDistribution: Array<{ name: string; value: number }>;
  topicsData: Array<{ name: string; value: number }>;
  totalStars: number;
}

// 处理数据，将小于阈值的项合并为"其他"
function processChartData(data: Array<{ name: string; value: number }>, threshold: number) {
  if (!data) return []
  
  // 按值排序
  const sortedData = [...data].sort((a, b) => b.value - a.value)
  
  // 分离大于和小于阈值的项
  const mainItems = sortedData.filter(item => item.value >= threshold)
  const smallItems = sortedData.filter(item => item.value < threshold)
  
  // 如果有小于阈值的项，将它们合并
  if (smallItems.length > 0) {
    const othersValue = smallItems.reduce((sum, item) => sum + item.value, 0)
    mainItems.push({
      name: '其他',
      value: othersValue
    })
  }
  
  return mainItems
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/starinsight/api/analytics')
        
        if (!response.ok) {
          throw new Error(`Request failed: ${response.statusText}`)
        }

        const analyticsData = await response.json()
        
        if (!analyticsData) {
          throw new Error('Empty response data')
        }

        setData(analyticsData)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchAnalytics()
    }
  }, [status, retryCount])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">加载数据出错</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <button 
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
            >
              重新加载
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 处理语言数据和Star分布数据
  const processedLanguageData = processChartData(data?.languageData || [], 3) // 少于3个的归为其他
  const processedStarData = processChartData(data?.starDistribution || [], 2) // 少于2个的归为其他

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Stars Analytics</h1>
        <p className="text-muted-foreground">
          深入分析你的个已收藏的 GitHub 仓库
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <Card className="col-span-full md:col-span-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">编程语言分布</CardTitle>
            <CardDescription>按编程语言统计的项目数量分布</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartCard
              data={processedLanguageData}
              type="bar"
            />
          </CardContent>
        </Card>

        <Card className="col-span-full md:col-span-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Star 数量分布</CardTitle>
            <CardDescription>按 Star 数量范围统计的项目分布</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartCard
              data={processedStarData}
              type="pie"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">总收藏数</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>所有已收藏的仓库数量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalStars || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">主要语言</CardTitle>
              <Languages className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>使用最多的编程语言</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedLanguageData[0]?.name || "暂无数据"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Star 范围</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>最常见的 Star 数量范围</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedStarData[0]?.name || "暂无数据"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 