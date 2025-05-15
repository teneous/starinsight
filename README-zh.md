# StarInsight

一个使用 Cursor IDE 开发的 GitHub Star 管理应用，帮助用户更好地管理和理解已收藏的项目。

## 项目概述

StarInsight 旨在为管理 GitHub 已收藏仓库提供一个智能且直观的解决方案。该项目致力于解决用户在收藏大量仓库后缺乏有效组织的问题，使得查找和利用这些资源变得困难的现状。

## Demo
`https://syoka.icu/starinsight`

## 功能特性

### 项目列表（开发中）
- 在一个页面查看所有已收藏的仓库
- 高级筛选和排序功能
- 快速访问仓库详情和统计信息
- 现代化响应式界面设计

### 数据分析面板（开发中）
- 可视化收藏历史和趋势
- 编程语言分布分析
- 主题和类别统计
- 交互式图表展示

### AI 智能功能（开发中）
- 自动仓库分类
- 智能项目推荐
- 相关仓库建议
- 智能搜索和发现

## 技术栈

- **前端框架**: Next.js, React, TypeScript
- **样式方案**: Tailwind CSS, shadcn/ui
- **身份认证**: NextAuth.js 集成 GitHub OAuth
- **图表库**: Recharts
- **AI 集成**: OpenAI API

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/yourusername/starinsight.git
cd starinsight
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
```
然后填入你的 GitHub OAuth 和 OpenAI API 凭证。

4. 启动开发服务器
```bash
npm run dev
```

## 参与贡献

欢迎提交 Pull Request 来帮助改进这个项目！

## 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件。

## 致谢

本项目使用 [Cursor](https://cursor.sh) 开发，这是一个基于 AI 的代码编辑器，显著提升了开发效率。 