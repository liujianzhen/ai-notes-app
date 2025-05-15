# AI辅助笔记应用 - 项目知识库

## 项目概述

本项目是一个AI辅助笔记应用，采用现代化轻量级全栈开发方案，旨在实现快速开发、迭代和部署。该应用允许用户创建、编辑、组织笔记，并通过AI功能增强笔记的价值，如自动摘要生成、智能标签推荐等。技术栈专为独立开发者或小型团队设计，提供高效率、低成本的开发体验。

## 产品功能

### 核心功能
- 用户身份验证与授权
- 笔记的创建、编辑、删除和分类
- 富文本编辑器（支持Markdown）
- 基于AI的自动摘要生成
- 内容智能标签推荐
- 笔记全文搜索
- 笔记分享功能

### 未来功能
- 协作编辑
- 版本历史
- 语音转文本
- 文件附件支持
- 笔记导出（PDF、Markdown等）
- 自定义主题

## 技术栈详情

### 前端技术栈

#### 核心框架
- **Next.js**: React框架，提供服务端渲染(SSR)、静态站点生成(SSG)和路由管理
- **TypeScript**: 类型安全的JavaScript超集
- **Tailwind CSS**: 原子化CSS框架，提高样式开发效率
- **Shadcn UI**: 美观的UI组件库，基于Radix UI和Tailwind CSS

#### 其他前端工具
- **MDX Editor**: Markdown富文本编辑器
- **Zustand**: 轻量级状态管理库
- **TanStack Query + Axios**: API请求和数据获取
- **Lucide React**: 简洁美观的图标库
- **React Hook Form + Zod**: 表单处理和数据验证组合
- **Framer Motion**: 动画效果库

### 后端技术栈

#### 主要后端（Node.js）
- **Node.js + Express**: JavaScript服务端环境和Web框架
- **Prisma**: 现代ORM工具，简化数据库操作
- **BullMQ + Redis**: 任务队列系统，处理异步任务
- **Swagger**: API文档自动生成工具

#### AI服务后端（Python）
- **Python + FastAPI**: Python后端服务，主要用于AI功能集成
- **OpenAI/Claude API**: 用于AI功能的API集成
- **spaCy**: 自然语言处理库，用于文本分析
- **scikit-learn**: 用于简单的机器学习任务

### 数据库与存储
- **Supabase**: 开源的Firebase替代品
  - PostgreSQL数据库：存储用户数据和笔记内容
  - 身份认证服务：处理用户注册、登录和权限
  - 对象存储：存储用户上传的文件和图片
  - 实时订阅：实时更新笔记内容（未来协作功能）

### 部署与DevOps
- **Vercel**: 前端和Next.js API路由部署
- **fly.io**: Python AI后端服务部署
- **GitHub**: 代码版本控制
- **CI/CD**: 通过Vercel和fly.io的自动部署流程

## 项目结构

```
ai-notes-app/
├── src/                      # 源代码目录
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API路由
│   │   │   ├── auth/         # 认证相关API
│   │   │   ├── notes/        # 笔记相关API
│   │   │   └── ai/           # AI功能相关API
│   │   ├── (auth)/           # 认证相关页面
│   │   │   ├── login/        # 登录页面
│   │   │   ├── register/     # 注册页面
│   │   │   └── layout.tsx    # 认证页面布局
│   │   ├── dashboard/        # 用户仪表盘
│   │   ├── notes/            # 笔记页面
│   │   ├── settings/         # 用户设置页面
│   │   └── layout.tsx        # 根布局组件
│   ├── components/           # UI组件
│   │   ├── ui/               # 基础UI组件
│   │   ├── notes/            # 笔记相关组件
│   │   │   ├── editor.tsx    # 笔记编辑器
│   │   │   ├── note-card.tsx # 笔记卡片
│   │   │   └── tags.tsx      # 标签组件
│   │   ├── dashboard/        # 仪表盘组件
│   │   └── layout/           # 布局组件
│   ├── lib/                  # 通用库和工具函数
│   │   ├── utils.ts          # 工具函数
│   │   ├── db.ts             # 数据库连接
│   │   ├── supabase.ts       # Supabase客户端
│   │   └── ai.ts             # AI服务客户端
│   ├── server/               # 服务端代码
│   │   ├── api/              # API处理函数
│   │   └── db/               # 数据库模型和查询
│   └── styles/               # 全局样式
├── prisma/                   # Prisma ORM相关文件
│   └── schema.prisma         # 数据库模型定义
├── public/                   # 静态资源
├── python-backend/           # Python后端服务
│   ├── app/                  # FastAPI应用
│   │   ├── routers/          # API路由
│   │   │   ├── summary.py    # 摘要生成
│   │   │   └── tags.py       # 标签推荐
│   │   ├── models/           # 数据模型
│   │   ├── services/         # 服务层
│   │   │   ├── openai.py     # OpenAI服务
│   │   │   └── claude.py     # Claude API服务
│   │   └── main.py           # 入口文件
│   ├── requirements.txt      # Python依赖
│   └── Dockerfile            # Python服务容器配置
├── scripts/                  # 项目脚本
├── .env                      # 环境变量
├── package.json              # 项目依赖
├── tsconfig.json             # TypeScript配置
└── tailwind.config.js        # Tailwind CSS配置
```

## 数据模型设计

### 用户表 (User)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  notes     Note[]
  folders   Folder[]
}
```

### 笔记表 (Note)
```prisma
model Note {
  id          String    @id @default(cuid())
  title       String
  content     String    @db.Text
  summary     String?   @db.Text
  isPublic    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  folderId    String?
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder      Folder?   @relation(fields: [folderId], references: [id])
  tags        Tag[]     @relation("NoteToTag")
}
```

### 文件夹表 (Folder)
```prisma
model Folder {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  notes     Note[]
}
```

### 标签表 (Tag)
```prisma
model Tag {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  notes     Note[]   @relation("NoteToTag")
}
```

## API设计

### 认证API
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/user` - 获取当前用户信息

### 笔记API
- `GET /api/notes` - 获取用户笔记列表
- `GET /api/notes/:id` - 获取单个笔记详情
- `POST /api/notes` - 创建新笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记
- `GET /api/notes/search` - 搜索笔记

### 文件夹API
- `GET /api/folders` - 获取用户文件夹列表
- `POST /api/folders` - 创建新文件夹
- `PUT /api/folders/:id` - 更新文件夹
- `DELETE /api/folders/:id` - 删除文件夹

### 标签API
- `GET /api/tags` - 获取标签列表
- `POST /api/tags` - 创建新标签
- `DELETE /api/tags/:id` - 删除标签

### AI功能API
- `POST /api/ai/summarize` - 生成笔记摘要
- `POST /api/ai/suggest-tags` - 推荐笔记标签

## 开发流程

1. **本地开发**
   - 使用 `npm run dev` 启动Next.js开发服务器
   - 使用 `cd python-backend && uvicorn app.main:app --reload` 启动Python服务

2. **数据库操作**
   - 使用Prisma进行数据库迁移: `npx prisma migrate dev`
   - 数据库管理通过Supabase控制台

3. **部署流程**
   - 前端: 推送到GitHub后，Vercel自动部署
   - Python AI后端: 通过fly.io部署 `fly deploy`

## 环境变量配置

项目需要以下环境变量:

```
# Next.js
NEXT_PUBLIC_API_URL=

# 数据库
DATABASE_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI服务
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
OPENAI_API_KEY=
CLAUDE_API_KEY=

# Python后端
NEXT_PUBLIC_PYTHON_API_URL=

# 其他服务
REDIS_URL=
```

## 开发阶段与里程碑

### 阶段1: 基础架构搭建 (1周)
- [x] 项目初始化
- [ ] 基础框架搭建
- [ ] 数据库模型设计
- [ ] Supabase集成
- [ ] 基本的用户认证系统

### 阶段2: 笔记基础功能 (1-2周)
- [ ] 笔记CRUD功能
- [ ] 富文本编辑器集成
- [ ] 文件夹和分类功能
- [ ] 笔记搜索功能

### 阶段3: AI功能集成 (1-2周)
- [ ] Python FastAPI后端搭建
- [ ] OpenAI/Claude API集成
- [ ] 笔记摘要生成功能
- [ ] 标签推荐功能

### 阶段4: 优化与部署 (1周)
- [ ] UI/UX优化
- [ ] 性能优化
- [ ] 安全性审查
- [ ] Vercel和fly.io部署
- [ ] 用户测试与bug修复

## 资源与参考

- [Next.js官方文档](https://nextjs.org/docs)
- [Prisma文档](https://www.prisma.io/docs)
- [Supabase文档](https://supabase.com/docs)
- [Tailwind CSS文档](https://tailwindcss.com/docs)
- [FastAPI文档](https://fastapi.tiangolo.com/)
- [OpenAI API文档](https://platform.openai.com/docs/api-reference)
- [Claude API文档](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Vercel部署文档](https://vercel.com/docs)
- [fly.io部署文档](https://fly.io/docs/)
- [MDX编辑器](https://github.com/mdx-editor/editor) 