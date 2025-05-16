import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getGitHubStarredRepos } from '@/lib/github';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 设置最大执行时间为 300 秒

export async function GET() {
  try {
    // 检查认证
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 获取所有 starred 仓库
    const starredRepos = await getGitHubStarredRepos(session, (progress) => {
      // Log progress for monitoring
      console.log(`Fetching progress: ${progress.percentage}%`);
    });

    if (!starredRepos) {
      return NextResponse.json(
        { error: 'Failed to fetch starred repositories' },
        { status: 500 }
      );
    }

    // Process language statistics
    const languageStats = new Map<string, number>();
    starredRepos.forEach(repo => {
      const language = repo.language || 'Unknown';
      languageStats.set(language, (languageStats.get(language) || 0) + 1);
    });

    const languageData = Array.from(languageStats.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Process topics statistics
    const topicsStats = new Map<string, number>();
    starredRepos.forEach(repo => {
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.forEach(topic => {
          topicsStats.set(topic, (topicsStats.get(topic) || 0) + 1);
        });
      }
    });

    const topicsData = Array.from(topicsStats.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20); // Return top 20 most used tags

    // Process star count distribution
    const starRanges = [
      { min: 0, max: 100, label: '<100' },
      { min: 101, max: 1000, label: '<1k' },
      { min: 1001, max: 5000, label: '1k-5k' },
      { min: 5001, max: 10000, label: '5k-10k' },
      { min: 10001, max: Infinity, label: '10k+' }
    ];

    const starDistribution = starRanges.map(range => ({
      name: range.label,
      value: starredRepos.filter(repo => 
        repo.stargazers_count >= range.min && 
        repo.stargazers_count <= range.max
      ).length
    })).filter(item => item.value > 0); // Only return ranges with data

    // Return analytics data
    return NextResponse.json({
      languageData,
      topicsData,
      starDistribution,
      totalStars: starredRepos.length,
      metadata: {
        fetchedAt: new Date().toISOString(),
        totalRepos: starredRepos.length,
      }
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 