'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SignOut() {
  useEffect(() => {
    signOut({ callbackUrl: '/' });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">正在退出...</h2>
        <p className="mt-2 text-muted-foreground">请稍候，正在安全退出你的账号</p>
      </div>
    </div>
  );
}
