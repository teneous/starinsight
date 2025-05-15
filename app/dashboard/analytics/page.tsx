'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Bar, BarChart, CartesianGrid, PieChart, Pie, Cell, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import { Filter, HardDrive, Languages } from 'lucide-react'

// Define data structure
interface AnalyticsData {
  languageData: Array<{ name: string; value: number }>;
  starDistribution: Array<{ name: string; value: number }>;
  totalStars: number;
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

        console.log('Fetching analytics data...')
        // Use dedicated analytics API to get full data
        const response = await fetch('/api/analytics')
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error:', response.status, errorText)
          throw new Error(`Request failed: ${response.statusText}`)
        }

        const analyticsData = await response.json()
        console.log('Analytics data received:', analyticsData)
        
        if (!analyticsData) {
          throw new Error('Empty response data')
        }

        // Basic validation
        if (
          !Array.isArray(analyticsData.languageData) || 
          !Array.isArray(analyticsData.starDistribution) ||
          typeof analyticsData.totalStars !== 'number'
        ) {
          console.error('Invalid API response format:', analyticsData)
          throw new Error('Invalid API response format')
        }

        setData(analyticsData)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    // Only fetch data when authenticated
    if (status === 'authenticated') {
      fetchAnalytics()
    }
  }, [status, retryCount]) // Depends on status and retryCount to trigger retries

  // Chart configurations
  const languageChartConfig = data?.languageData?.reduce((config, item) => {
    config[item.name] = {
      label: item.name,
      color: getLanguageColor(item.name)
    }
    return config
  }, {} as ChartConfig) || {}

  const starChartConfig = {
    'value': {
      label: 'Number of Projects',
      color: 'hsl(var(--chart-1))'
    }
  } as ChartConfig

  // Get language color
  function getLanguageColor(language: string) {
    const colors = [
      'hsl(var(--chart-1))', 
      'hsl(var(--chart-2))', 
      'hsl(var(--chart-3))', 
      'hsl(var(--chart-4))', 
      'hsl(var(--chart-5))'
    ]
    
    // Fixed colors for common languages
    switch (language) {
      case 'JavaScript': return '#f7df1e'
      case 'TypeScript': return '#3178c6'
      case 'Python': return '#3572A5'
      case 'Java': return '#b07219'
      case 'Go': return '#00ADD8'
      case 'Rust': return '#dea584'
      case 'No Data': return '#888888'
      case 'Error': return '#ff0000'
      default:
        // Map other languages to color array by index
        const index = language.length % colors.length
        return colors[index]
    }
  }

  // Retry function
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
            <CardTitle className="text-red-500">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <button 
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
            >
              Reload
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Stars Analytics</h1>
        <p className="text-muted-foreground">Analyzing your {data?.totalStars || 0} starred GitHub repositories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Language Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Language Distribution</CardTitle>
              <CardDescription>Programming languages statistics of starred projects</CardDescription>
            </div>
            <Languages className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ChartContainer config={languageChartConfig} className="min-h-[280px] w-full">
              <PieChart accessibilityLayer>
                <Pie
                  data={data?.languageData || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data?.languageData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getLanguageColor(entry.name)} />
                  )) || []}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Star Count Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Star Count Distribution</CardTitle>
              <CardDescription>Projects grouped by star count</CardDescription>
            </div>
            <Filter className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ChartContainer config={starChartConfig} className="min-h-[280px] w-full">
              <BarChart accessibilityLayer data={data?.starDistribution || []}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Repository Overview */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>Repository Overview</CardTitle>
            <CardDescription>Number and distribution of starred GitHub repositories</CardDescription>
          </div>
          <HardDrive className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="font-medium text-sm text-muted-foreground mb-1">Total Stars</div>
              <div className="text-2xl font-bold">{data?.totalStars || 0}</div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="font-medium text-sm text-muted-foreground mb-1">Most Used Language</div>
              <div className="text-2xl font-bold">{data?.languageData?.[0]?.name || 'No Data'}</div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="font-medium text-sm text-muted-foreground mb-1">Most Common Star Range</div>
              <div className="text-2xl font-bold">
                {data?.starDistribution?.sort((a, b) => b.value - a.value)[0]?.name || 'No Data'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 