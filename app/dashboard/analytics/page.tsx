'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartCard } from '@/components/ui/chart';
import { Filter, HardDrive, Languages } from 'lucide-react';
import { AnalyticsData } from '@/types/github';

// 处理数据，将小于阈值的项合并为"其他"
function processChartData(data: Array<{ name: string; value: number }>, threshold: number) {
  if (!data) return [];

  // 按值排序
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // 分离大于和小于阈值的项
  const mainItems = sortedData.filter(item => item.value >= threshold);
  const smallItems = sortedData.filter(item => item.value < threshold);

  // 如果有小于阈值的项，将它们合并
  if (smallItems.length > 0) {
    const othersValue = smallItems.reduce((sum, item) => sum + item.value, 0);
    mainItems.push({
      name: '其他',
      value: othersValue,
    });
  }

  return mainItems;
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/starinsight/api/analytics', {
          // 设置较长的超时时间
          signal: AbortSignal.timeout(5 * 60 * 1000), // 5 minutes timeout
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Request failed: ${response.statusText}`);
        }

        const analyticsData = await response.json();

        if (!analyticsData) {
          throw new Error('Empty response data');
        }

        setData(analyticsData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchAnalytics();
    }
  }, [status, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Data</CardTitle>
            <CardDescription>
              Fetching and analyzing your GitHub Stars data, this may take a few minutes...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Initial loading may take longer if you have a large number of starred repositories
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription>
              An error occurred while fetching data. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={handleRetry}
              className="w-full mt-4 px-4 py-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 处理语言数据和Star分布数据
  const processedLanguageData = processChartData(data?.languageData || [], 3); // 少于3个的归为其他
  const processedStarData = processChartData(data?.starDistribution || [], 2); // 少于2个的归为其他

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Stars Analytics</h1>
        <p className="text-muted-foreground">
          Analyzing your {data?.totalStars || 0} starred GitHub repositories
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <Card className="col-span-full md:col-span-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Language Distribution</CardTitle>
            <CardDescription>
              Distribution of programming languages across starred repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartCard data={processedLanguageData} type="bar" />
          </CardContent>
        </Card>

        <Card className="col-span-full md:col-span-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Star Count Distribution</CardTitle>
            <CardDescription>Distribution of repositories by star count ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartCard data={processedStarData} type="pie" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Total Stars</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Total number of starred repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalStars || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Primary Language</CardTitle>
              <Languages className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Most used programming language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedLanguageData[0]?.name || 'No data'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Star Range</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Most common star count range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedStarData[0]?.name || 'No data'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
