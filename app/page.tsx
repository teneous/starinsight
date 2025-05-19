'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { GlowingTitle } from '@/components/home/HomeTitle';
import { LoginButton } from '@/components/home/LoginButton';
import { Radar } from '@/components/home/Radar';
// import '@/styles/animations.css'

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶部装饰 */}
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

      {/* 主要内容 */}
      <main className="flex-1 flex items-center">
        <div className="w-full max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* 左侧内容 */}
            <div className="space-y-12">
              <GlowingTitle />
              <LoginButton />
            </div>

            {/* 右侧动画 */}
            <Radar />
          </div>
        </div>
      </main>

      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-background via-background to-primary/5" />
    </div>
  );
}
