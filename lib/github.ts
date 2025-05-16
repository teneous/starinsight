import { Session } from 'next-auth'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
}

interface FetchProgress {
  current: number
  total: number
  percentage: number
}

// 解析 Link header 获取下一页的 URL 和总页数
function parseLinkHeader(linkHeader: string | null): { nextUrl: string | null; totalPages: number | null } {
  if (!linkHeader) return { nextUrl: null, totalPages: null }

  const links = linkHeader.split(',')
  let nextUrl: string | null = null
  let totalPages: number | null = null

  links.forEach(link => {
    const [urlPart, relPart] = link.split(';')
    const url = urlPart.trim().slice(1, -1)
    
    if (relPart.includes('rel="next"')) {
      nextUrl = url
    } else if (relPart.includes('rel="last"')) {
      const pageMatch = url.match(/[?&]page=(\d+)/)
      if (pageMatch) {
        totalPages = parseInt(pageMatch[1], 10)
      }
    }
  })

  return { nextUrl, totalPages }
}

export async function getGitHubStarredRepos(
  session: Session,
  onProgress?: (progress: FetchProgress) => void
): Promise<GitHubRepo[] | null> {
  try {
    if (!session.accessToken) {
      throw new Error('No access token available')
    }

    const allRepos: GitHubRepo[] = []
    let currentUrl = 'https://api.github.com/user/starred?per_page=100'
    let currentPage = 1
    let totalPages: number | null = null

    while (currentUrl) {
      const response = await fetch(currentUrl, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch starred repositories: ${response.statusText}`)
      }

      // 获取当前页数据
      const repos = await response.json()
      allRepos.push(...repos)

      // 解析 Link header
      const linkHeader = response.headers.get('link')
      const { nextUrl, totalPages: parsedTotalPages } = parseLinkHeader(linkHeader)

      // 更新总页数（仅在第一次请求时）
      if (totalPages === null && parsedTotalPages !== null) {
        totalPages = parsedTotalPages
      }

      // 如果没有下一页，说明只有一页
      if (totalPages === null) {
        totalPages = 1
      }

      // 报告进度
      if (onProgress) {
        onProgress({
          current: currentPage,
          total: totalPages,
          percentage: Math.round((currentPage / totalPages) * 100)
        })
      }

      // 准备下一次请求
      currentUrl = nextUrl || ''
      currentPage++

      // 添加延迟以避免触发 GitHub API 限制
      if (currentUrl) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return allRepos
  } catch (error) {
    console.error('Error fetching GitHub starred repos:', error)
    return null
  }
} 