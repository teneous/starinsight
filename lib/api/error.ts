export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const API_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_ERROR_MESSAGES = {
  [API_ERROR_CODES.UNAUTHORIZED]: '未授权，请先登录',
  [API_ERROR_CODES.FORBIDDEN]: '无权访问该资源',
  [API_ERROR_CODES.NOT_FOUND]: '请求的资源不存在',
  [API_ERROR_CODES.INTERNAL_SERVER_ERROR]: '服务器内部错误',
} as const;
