'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Pagination } from '../../components/ui/pagination'
import { Star } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'

interface StarredRepo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  language: string
  topics: string[]
}

interface Category {
  name: string
  description: string
  repositories: {
    name: string
    reason: string
  }[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stars, setStars] = useState<StarredRepo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchStars()
    }
  }, [session, currentPage, itemsPerPage])

  const fetchStars = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/starinsight/api/stars?page=${currentPage}&pageSize=${itemsPerPage}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '获取数据失败')
      }
      const data = await response.json()
      
      // 更新状态
      setStars(data.items)
      setTotalItems(data.total)
      setTotalPages(Math.ceil(data.total / itemsPerPage))
      setHasNextPage(data.hasNextPage)
      setHasPreviousPage(data.hasPreviousPage)
      
      if (data.items.length > 0) {
        analyzeRepositories(data.items)
      }
    } catch (error) {
      console.error('Error:', error)
      setStars([])
    } finally {
      setLoading(false)
    }
  }

  const analyzeRepositories = async (repositories: StarredRepo[]) => {
    try {
      setAnalyzing(true)
      const response = await fetch('/starinsight/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repositories),
      })
      
      if (!response.ok) throw new Error('分析失败')
      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error('分析错误:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  // 获取当前页的项目
  const getCurrentPageItems = () => {
    return stars // 现在直接返回 stars，因为已经是当前页的数据
  }

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 处理每页显示数量变化
  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size)
    setCurrentPage(1) // 重置到第一页
  }

  const getLanguageColor = (language: string) => {
    // 这个函数会通过 CSS 自动处理颜色
    return language
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Projects</CardTitle>
            <CardDescription>
              Fetching your GitHub starred repositories, this may take a few moments...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Please wait while we load your starred repositories
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-3xl font-bold mb-8">Starred Projects</h1>
      
      {analyzing ? (
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyzing Projects</CardTitle>
              <CardDescription>
                Analyzing your starred repositories to provide meaningful insights...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Categorizing and analyzing your repositories based on their characteristics
              </p>
            </CardContent>
          </Card>
        </div>
      ) : categories.length > 0 ? (
        <div className="space-y-8">
          {categories.map((category, index) => (
            <div key={index} className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
              <p className="text-muted-foreground mb-6">{category.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.repositories.map((repo, repoIndex) => {
                  const fullRepo = stars.find(s => s.name === repo.name)
                  if (!fullRepo) return null
                  
                  return (
                    <div key={repoIndex} className="card">
                      <div className="card-header">
                        <h3 className="card-title">{repo.name}</h3>
                      </div>
                      <p className="card-description">{fullRepo.description}</p>
                      <p className="text-sm text-muted-foreground mt-4 italic">"{repo.reason}"</p>
                      
                      <div className="card-footer">
                        <div className="card-stats">
                          {fullRepo.language && (
                            <div className="repo-language">
                              <span 
                                className="repo-language-dot" 
                                data-language={fullRepo.language}
                              />
                              <span>{fullRepo.language}</span>
                            </div>
                          )}
                          <div className="repo-stars">
                            <Star className="fill-current" />
                            <span>{fullRepo.stargazers_count.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <a
                          href={fullRepo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="card-link"
                        >
                          View Project
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : stars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stars.map((repo) => (
            <div key={repo.id} className="card">
              <div className="card-header">
                <h2 className="card-title">{repo.name}</h2>
              </div>
              <p className="card-description">{repo.description}</p>
              
              <div className="card-footer">
                <div className="card-stats">
                  {repo.language && (
                    <div className="repo-language">
                      <span 
                        className="repo-language-dot" 
                        data-language={repo.language}
                      />
                      <span>{repo.language}</span>
                    </div>
                  )}
                  <div className="repo-stars">
                    <Star className="fill-current" />
                    <span>{repo.stargazers_count.toLocaleString()}</span>
                  </div>
                </div>
                
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-link"
                >
                  View Project
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No starred projects found
        </div>
      )}

      {stars.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={itemsPerPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
} 