// GitHub 仓库基本信息
export interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  reason?: string; // 分析原因说明
}

// 仓库分类信息
export interface StarredRepoCategory {
  id: string;
  name: string;
  description?: string;
  repos: GithubRepository[];
}

// 仓库分析结果
export interface RepoAnalytics {
  totalStars: number;
  languageDistribution: Record<string, number>;
  topCategories: StarredRepoCategory[];
  recentActivity: {
    date: string;
    count: number;
  }[];
}

// 话题分组分析结果
export interface TopicGroupAnalysis {
  name: string;
  count: number;
  repositories: Array<{
    name: string;
    description: string;
    url: string;
    stars: number;
  }>;
}

// 时间趋势分析结果
export interface TimeBasedAnalysis {
  recentStars: number; // 最近一个月star的仓库数
  totalStars: number;
  starTrends: Array<{
    month: string;
    count: number;
  }>;
}

// 完整的分析结果
export interface RepositoryAnalysisResult {
  topicGroups: TopicGroupAnalysis[];
  timeBasedAnalysis: TimeBasedAnalysis;
  popularRepositories: Array<{
    name: string;
    description: string;
    url: string;
    stars: number;
    topics: string[];
  }>;
}

// 语言统计数据
export interface LanguageStatistics {
  name: string;
  value: number;
}

// 主题标签统计数据
export interface TopicStatistics {
  name: string;
  value: number;
}

// Star 数量分布
export interface StarDistribution {
  name: string; // 例如: "<100", "1k-5k" 等
  value: number;
}

// 完整的统计分析数据
export interface AnalyticsData {
  languageData: LanguageStatistics[];
  topicsData: TopicStatistics[];
  starDistribution: StarDistribution[];
  totalStars: number;
  metadata: {
    fetchedAt: string;
    totalRepos: number;
  };
}
