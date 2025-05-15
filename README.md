# AI辅助笔记应用

一个现代化的AI辅助笔记应用，帮助用户更高效地管理和组织知识。

## 主要功能

- 用户身份验证与授权
- 笔记的创建、编辑、删除和分类
- 富文本编辑器（支持Markdown）
- 基于AI的自动摘要生成
- 内容智能标签推荐
- 笔记全文搜索
- 笔记分享功能

## 技术栈

- **前端**: Next.js, TypeScript, Tailwind CSS, Shadcn UI
- **后端**: Node.js (Next.js API Routes), Python (FastAPI)
- **数据库**: Supabase (PostgreSQL)
- **AI服务**: OpenAI/Claude API

## 快速开始

1. 克隆仓库

```bash
git clone https://github.com/yourusername/ai-notes-app.git
cd ai-notes-app
```

2. 安装依赖

```bash
npm install
```

3. 设置环境变量

复制`.env.example`为`.env.local`并填写相关配置。

4. 运行开发服务器

```bash
npm run dev
```

5. 在浏览器中访问 [http://localhost:3000](http://localhost:3000)

## 许可证

MIT 