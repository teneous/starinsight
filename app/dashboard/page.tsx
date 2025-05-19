'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { githubApi } from '@/lib/api';
import type { GithubRepository, StarredRepoCategory } from '@/types';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stars, setStars] = useState<GithubRepository[]>([]);
  const [categories, setCategories] = useState<StarredRepoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchStars();
    }
  }, [session, currentPage, itemsPerPage]);

  const fetchStars = async () => {
    try {
      setLoading(true);
      const data = await githubApi.getStarredRepos(currentPage, itemsPerPage);
      if (!data || !Array.isArray(data.items)) {
        setStars([]);
        setTotalItems(0);
        setTotalPages(1);
        return;
      }

      setStars(data.items);
      setTotalItems(data.total);
      setTotalPages(Math.ceil(data.total / itemsPerPage));

      if (data.items.length > 0) {
        analyzeStars(data.items);
      }
    } catch (error) {
      console.error('Error:', error);
      setStars([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const analyzeStars = async (repositories: GithubRepository[]) => {
    try {
      setAnalyzing(true);
      const response = await githubApi.analyzeRepositories(repositories);
      setCategories(response.data);
    } catch (error) {
      console.error('分析错误:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // 获取当前页的项目
  const getCurrentPageItems = () => {
    return stars; // 现在直接返回 stars，因为已经是当前页的数据
  };

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 处理每页显示数量变化
  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1); // 重置到第一页
  };

  const getLanguageColor = (language: string) => {
    // 这个函数会通过 CSS 自动处理颜色
    return language;
  };

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
    );
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
                {category.repos.map((repo, repoIndex) => {
                  const fullRepo = stars.find(s => s.name === repo.name);
                  if (!fullRepo) return null;

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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : stars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stars.map(repo => (
            <div key={repo.id} className="card">
              <div className="card-header">
                <h2 className="card-title">{repo.name}</h2>
              </div>
              <p className="card-description">{repo.description}</p>

              <div className="card-footer">
                <div className="card-stats">
                  {repo.language && (
                    <div className="repo-language">
                      <span className="repo-language-dot" data-language={repo.language} />
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
        <div className="text-center py-8 text-muted-foreground">No starred projects found</div>
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
  );
}
