import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { githubApi } from '@/lib/api';
import { GithubRepository, RepositoryAnalysisResult } from '@/types';

interface AnalysisResult {
  topicGroups: {
    name: string;
    count: number;
    repositories: Array<{
      name: string;
      description: string;
      url: string;
      stars: number;
    }>;
  }[];
  timeBasedAnalysis: {
    recentStars: number; // 最近一个月star的仓库数
    totalStars: number;
    starTrends: {
      month: string;
      count: number;
    }[];
  };
  popularRepositories: {
    name: string;
    description: string;
    url: string;
    stars: number;
    topics: string[];
  }[];
}

function analyzeRepositories(repositories: GithubRepository[]): RepositoryAnalysisResult {
  // 1. 话题分组分析
  const topicMap = new Map<
    string,
    {
      count: number;
      repositories: Array<{
        name: string;
        description: string;
        url: string;
        stars: number;
      }>;
    }
  >();

  repositories.forEach(repo => {
    repo.topics.forEach((topic: string) => {
      if (!topicMap.has(topic)) {
        topicMap.set(topic, {
          count: 0,
          repositories: [],
        });
      }
      const topicData = topicMap.get(topic)!;
      topicData.count++;
      topicData.repositories.push({
        name: repo.name,
        description: repo.description || '',
        url: repo.html_url,
        stars: repo.stargazers_count,
      });
    });
  });

  // 2. 时间趋势分析
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const recentStars = repositories.filter(repo => new Date(repo.created_at) > oneMonthAgo).length;

  // 按月统计star趋势
  const monthlyStars = new Map<string, number>();
  repositories.forEach(repo => {
    const date = new Date(repo.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyStars.set(monthKey, (monthlyStars.get(monthKey) || 0) + 1);
  });

  const starTrends = Array.from(monthlyStars.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // 只保留最近12个月的数据

  // 3. 获取最受欢迎的仓库（按star数排序）
  const popularRepositories = repositories
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map(repo => ({
      name: repo.name,
      description: repo.description || '',
      url: repo.html_url,
      stars: repo.stargazers_count,
      topics: repo.topics,
    }));

  // 4. 整理话题分组（只返回前20个最热门的话题）
  const topicGroups = Array.from(topicMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      repositories: data.repositories.sort((a, b) => b.stars - a.stars).slice(0, 5), // 每个话题只保留前5个最受欢迎的仓库
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    topicGroups,
    timeBasedAnalysis: {
      recentStars,
      totalStars: repositories.length,
      starTrends,
    },
    popularRepositories,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 });
    }

    const repositories = await githubApi.fetchAllStarredReposFromGitHub(session);
    if (!repositories) {
      return NextResponse.json({ error: '获取仓库数据失败' }, { status: 500 });
    }

    const analysis = analyzeRepositories(repositories);
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Analysis Error:', error);
    return NextResponse.json({ error: '分析失败', details: error.message }, { status: 500 });
  }
}
