// 通用 API 响应格式
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// 分页响应格式
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API 错误响应
export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: unknown;
  status: number;
}

// API 进度报告
export interface ApiProgress {
  current: number;
  total: number;
  percentage: number;
  status?: string;
}

// GitHub API 相关类型
export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  topics: string[];
  created_at: string;
  updated_at: string;
  reason?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  repos: GithubRepo[];
}
