'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return '服务器配置错误，请联系管理员';
      case 'AccessDenied':
        return '访问被拒绝，请确保你有正确的权限';
      case 'Verification':
        return '验证链接已过期或无效';
      default:
        return '发生未知错误，请重试';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">认证错误</h2>
          <p className="mt-2 text-muted-foreground">{getErrorMessage()}</p>
        </div>

        <div className="flex justify-center mt-6">
          <Link href="/" className="text-sm font-medium text-primary hover:text-primary/90">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Error() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
