import { Session } from 'next-auth'

interface GitHubRepo {
  language: string | null
  stargazers_count: number
}

export async function getGitHubStarredRepos(session: Session): Promise<GitHubRepo[] | null> {
  try {
    if (!session.accessToken) {
      throw new Error('No access token available')
    }

    const response = await fetch('https://api.github.com/user/starred?per_page=100', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch starred repositories')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching GitHub starred repos:', error)
    return null
  }
} 