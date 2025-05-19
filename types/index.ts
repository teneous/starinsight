// 导出所有 API 相关类型
export * from './common';

// 导出所有 GitHub 相关类型
export * from './github';

// 类型别名，用于向后兼容
export type { GithubRepository as GithubRepo, StarredRepoCategory as Category } from './github';

export interface StarredRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  topics: string[];
}
