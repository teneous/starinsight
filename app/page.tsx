'use client'

import { useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          StarInsight - 智能管理你的 GitHub Stars
        </h1>
        
        <div className="text-center mb-12">
          <p className="text-xl text-gray-600 mb-6">
            使用 AI 智能分析和组织你的 GitHub Star 项目，发现更多有价值的资源
          </p>
          <button 
            onClick={() => signIn('github')}
            className="btn-primary text-lg"
          >
            使用 GitHub 登录
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">🤖 AI 智能分析</h2>
            <p className="text-gray-600">
              利用大模型分析你的 Star 项目，自动归类和总结，发现项目之间的关联
            </p>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">📊 个性化洞察</h2>
            <p className="text-gray-600">
              了解你的技术偏好，追踪兴趣变化，发现潜在的学习方向
            </p>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">🔍 智能搜索</h2>
            <p className="text-gray-600">
              基于语义的项目搜索，快速找到需要的资源
            </p>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">📈 趋势分析</h2>
            <p className="text-gray-600">
              掌握技术趋势，不错过任何重要的开源项目
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 