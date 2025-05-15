import { NextResponse } from 'next/server'
import axios from 'axios'

interface Repository {
  name: string
  description: string
  language: string
  topics: string[]
  html_url: string
}

async function analyzeRepositories(repositories: Repository[]) {
  const prompt = `分析以下 GitHub 仓库，并将它们按照技术领域、应用场景和功能特点进行分类。对于每个分类，解释为什么这些项目属于该分类。
  
  仓库信息：
  ${repositories.map(repo => `
  - 名称：${repo.name}
  - 描述：${repo.description || '无描述'}
  - 主要语言：${repo.language || '未指定'}
  - 话题标签：${repo.topics?.join(', ') || '无标签'}
  - 链接：${repo.html_url}
  `).join('\n')}
  
  请按照以下格式返回 JSON：
  {
    "categories": [
      {
        "name": "分类名称",
        "description": "分类描述",
        "repositories": [
          {
            "name": "仓库名称",
            "reason": "归入此类的原因"
          }
        ]
      }
    ]
  }`

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个专业的技术分析师，擅长对软件项目进行分类和分析。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    return response.data.choices[0].message.content
  } catch (error: any) {
    console.error('OpenAI API Error:', error.response?.data || error.message)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const repositories = await request.json()
    
    if (!Array.isArray(repositories) || repositories.length === 0) {
      return NextResponse.json(
        { error: '无效的仓库数据' },
        { status: 400 }
      )
    }

    const analysis = await analyzeRepositories(repositories)
    return NextResponse.json(JSON.parse(analysis))
  } catch (error: any) {
    console.error('Analysis Error:', error)
    return NextResponse.json(
      { error: '分析失败', details: error.message },
      { status: 500 }
    )
  }
} 