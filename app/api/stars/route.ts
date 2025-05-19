import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { authOptions } from '@/app/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 设置最大执行时间为 300 秒

// 缓存时间（10分钟）
const CACHE_DURATION = 10 * 60 * 1000;

// 内存缓存
const cache = new Map<
  string,
  {
    data: any[];
    timestamp: number;
  }
>();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // 验证分页参数
    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: '无效的页码' }, { status: 400 });
    }
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return NextResponse.json({ error: '无效的页面大小' }, { status: 400 });
    }

    // 先获取总数
    const countResponse = await axios.get('https://api.github.com/user/starred?per_page=1', {
      headers: {
        Authorization: `token ${session.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'StarInsight',
      },
    });

    // 从 Link header 解析总条数
    let totalItems = 0;
    const linkHeader = countResponse.headers.link || '';
    const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);

    if (lastPageMatch) {
      // 最后一页的页码就是总页数，每页显示1条时，总页数就等于总条数
      totalItems = parseInt(lastPageMatch[1]);
    } else {
      // 如果没有 last 页，说明只有一页数据
      totalItems = 1;
    }

    // 获取当前页的数据
    const starsResponse = await axios.get('https://api.github.com/user/starred', {
      headers: {
        Authorization: `token ${session.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'StarInsight',
      },
      params: {
        page,
        per_page: pageSize,
        sort: 'created',
        direction: 'desc',
      },
    });

    // 计算总页数
    const totalPages = Math.ceil(totalItems / pageSize);

    // 确保当前页不超过总页数
    const validPage = Math.min(page, totalPages);

    return NextResponse.json({
      items: starsResponse.data,
      total: totalItems,
      currentPage: validPage,
      pageSize: pageSize,
      totalPages: totalPages,
      hasNextPage: validPage < totalPages,
      hasPreviousPage: validPage > 1,
    });
  } catch (error: any) {
    console.error('Error fetching stars:', error);
    const errorMessage = error.response?.data?.message || error.message || '获取数据失败';
    return NextResponse.json({ error: errorMessage }, { status: error.response?.status || 500 });
  }
}
