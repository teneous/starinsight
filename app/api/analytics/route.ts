import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGitHubStarredRepos } from '@/lib/github';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get starred repositories
    const starredRepos = await getGitHubStarredRepos(session);
    if (!starredRepos) {
      return NextResponse.json(
        { error: 'Failed to fetch starred repositories' },
        { status: 500 }
      );
    }

    // Process language statistics
    const languageStats = new Map<string, number>();
    starredRepos.forEach(repo => {
      const language = repo.language || 'No Data';
      languageStats.set(language, (languageStats.get(language) || 0) + 1);
    });

    const languageData = Array.from(languageStats.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Process star count distribution
    const starRanges = [
      { min: 0, max: 10, label: '0-10' },
      { min: 11, max: 50, label: '11-50' },
      { min: 51, max: 100, label: '51-100' },
      { min: 101, max: 500, label: '101-500' },
      { min: 501, max: 1000, label: '501-1k' },
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
    }));

    // Return analytics data
    return NextResponse.json({
      languageData,
      starDistribution,
      totalStars: starredRepos.length
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 