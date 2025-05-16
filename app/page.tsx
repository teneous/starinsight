'use client'

import { useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Github } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function Home() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

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
              <div className="space-y-4">
                <div className="relative">
                  {/* 光锥效果 */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-primary/20 to-transparent blur-3xl opacity-60" />
                  <div className="relative">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl tracking-tight">
                      <span className="relative inline-block font-semibold">
                        <span className="absolute inset-0 bg-gradient-to-r from-primary/40 to-primary/10 blur-2xl" />
                        <span className="relative bg-gradient-to-br from-white via-white to-primary bg-clip-text text-transparent">
                          StarInsight
                        </span>
                        <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/50 via-primary/70 to-primary/50" />
                      </span>
                    </h1>
                  </div>
                </div>
                <p className="text-lg md:text-xl text-muted-foreground/80 font-light tracking-wide">
                  让 AI 重新定义你的技术收藏体验
                </p>
              </div>
              
              <div className="space-y-6">
                <Button
                  onClick={() => signIn('github')}
                  className="h-11 px-6 text-base"
                  variant="secondary"
                >
                  <Github className="mr-2 h-5 w-5" />
                  使用 GitHub 登录
                </Button>
              </div>
            </div>

            {/* 右侧雷达图效果 */}
            <div className="hidden lg:block relative">
              <div className="absolute -inset-4">
                <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/20 blur-3xl" />
              </div>
              <div className="relative aspect-square">
                {/* 雷达背景 */}
                <div className="absolute inset-0">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-full border border-primary/20"
                      style={{
                        transform: `scale(${1 - i * 0.2})`,
                        animation: `radar-scale 4s ${i * 0.5}s infinite`
                      }}
                    />
                  ))}
                </div>
                
                {/* 扫描线 */}
                <div className="absolute inset-0 origin-center animate-[spin_4s_linear_infinite]">
                  <div className="h-1/2 w-[2px] mx-auto bg-gradient-to-b from-primary/80 to-transparent blur-[2px]" />
                </div>
                
                {/* 动态点状装饰 */}
                <div className="absolute inset-0">
                  {[...Array(12)].map((_, i) => {
                    const radius = 20 + Math.random() * 30
                    const angle = (i * 30 + Math.random() * 15) * (Math.PI / 180)
                    return (
                      <span
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          top: `${50 + radius * Math.sin(angle)}%`,
                          left: `${50 + radius * Math.cos(angle)}%`,
                          backgroundColor: `rgba(${Math.random() > 0.5 ? '255,255,255' : '120,119,198'},${0.2 + Math.random() * 0.3})`,
                          animation: `pulse ${1 + Math.random() * 2}s ${Math.random() * 2}s infinite`,
                          boxShadow: '0 0 8px rgba(120,119,198,0.3)'
                        }}
                      />
                    )
                  })}
                </div>

                {/* 光点轨迹 */}
                <div className="absolute inset-0">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        animation: `trace-path ${6 + i * 2}s ${i * 2}s infinite`,
                        boxShadow: '0 0 12px rgba(120,119,198,0.5)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-background via-background to-primary/5" />
      
      {/* 添加全局动画样式 */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0.9; }
        }
        
        @keyframes radar-scale {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0.6; }
          100% { transform: scale(1); opacity: 0.4; }
        }

        @keyframes trace-path {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(0px);
            opacity: 0;
          }
          20% {
            transform: translate(-50%, -50%) rotate(180deg) translateX(100px);
            opacity: 1;
          }
          40% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(50px);
            opacity: 0.8;
          }
          60% {
            transform: translate(-50%, -50%) rotate(540deg) translateX(150px);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(720deg) translateX(0px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
} 