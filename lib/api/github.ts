import {
  AnalyticsData,
  ApiResponse,
  GithubRepository,
  PaginatedResponse,
  StarredRepoCategory,
} from '@/types';

import { Session } from 'next-auth';
import apiClient from './axios';

export interface FetchProgress {
  current: number;
  total: number;
  percentage: number;
}

export class GithubApiClient {
  private static instance: GithubApiClient;

  private constructor() {}

  static getInstance(): GithubApiClient {
    if (!GithubApiClient.instance) {
      GithubApiClient.instance = new GithubApiClient();
    }
    return GithubApiClient.instance;
  }

  // 解析 Link header 获取下一页的 URL 和总页数
  private parseLinkHeader(linkHeader: string | null): {
    nextUrl: string | null;
    totalPages: number | null;
  } {
    if (!linkHeader) return { nextUrl: null, totalPages: null };

    const links = linkHeader.split(',');
    let nextUrl: string | null = null;
    let totalPages: number | null = null;

    links.forEach(link => {
      const [urlPart, relPart] = link.split(';');
      const url = urlPart.trim().slice(1, -1);

      if (relPart.includes('rel="next"')) {
        nextUrl = url;
      } else if (relPart.includes('rel="last"')) {
        const pageMatch = url.match(/[?&]page=(\d+)/);
        if (pageMatch) {
          totalPages = parseInt(pageMatch[1], 10);
        }
      }
    });

    return { nextUrl, totalPages };
  }

  // 从 GitHub API 直接获取所有 starred 仓库
  async fetchAllStarredReposFromGitHub(
    session: Session,
    onProgress?: (progress: FetchProgress) => void
  ): Promise<GithubRepository[] | null> {
    try {
      if (!session.accessToken) {
        throw new Error('No access token available');
      }

      const allRepos: GithubRepository[] = [];
      let currentUrl = 'https://api.github.com/user/starred?per_page=100';
      let currentPage = 1;
      let totalPages: number | null = null;

      while (currentUrl) {
        const response = await fetch(currentUrl, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch starred repositories: ${response.statusText}`);
        }

        const repos = await response.json();
        allRepos.push(...repos);

        const linkHeader = response.headers.get('link');
        const { nextUrl, totalPages: parsedTotalPages } = this.parseLinkHeader(linkHeader);

        if (totalPages === null && parsedTotalPages !== null) {
          totalPages = parsedTotalPages;
        }

        if (totalPages === null) {
          totalPages = 1;
        }

        if (onProgress) {
          onProgress({
            current: currentPage,
            total: totalPages,
            percentage: Math.round((currentPage / totalPages) * 100),
          });
        }

        currentUrl = nextUrl || '';
        currentPage++;

        if (currentUrl) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return allRepos;
    } catch (error) {
      console.error('Error fetching GitHub starred repos:', error);
      return null;
    }
  }

  // 获取已收藏的仓库（从我们的 API）
  async getStarredRepos(
    page: number,
    pageSize: number
  ): Promise<PaginatedResponse<GithubRepository>> {
    const res = await apiClient.get<PaginatedResponse<GithubRepository>>('/stars', {
      params: { page, pageSize },
    });
    return res.data;
  }

  // 分析仓库
  async analyzeRepositories(
    repositories: GithubRepository[]
  ): Promise<ApiResponse<StarredRepoCategory[]>> {
    return apiClient.post<StarredRepoCategory[]>('/analyze', repositories);
  }
}

export const githubApi = GithubApiClient.getInstance();
export default githubApi;
