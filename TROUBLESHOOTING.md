# 故障排除指南

## 常见问题与解决方案

### 1. 'next' 不是内部或外部命令

**问题描述**：运行 `start-dev.bat` 脚本时出现 "'next' 不是内部或外部命令" 错误。

**解决方案**：
- 确保已经安装了所有依赖包：在项目根目录运行 `npm install`
- 确保在正确的目录中运行脚本：脚本应该在项目根目录下运行

### 2. 启动脚本路径问题

**问题描述**：存在两个启动脚本 (`start-dev.bat` 和 `scripts/start-dev.bat`)，可能会造成混淆。

**解决方案**：
- 使用根目录下的 `start-dev.bat` 脚本
- 确保脚本中包含了切换到正确目录的命令

### 3. 环境变量配置

**问题描述**：Next.js 应用需要正确的环境变量才能运行。

**解决方案**：
- 确保创建了 `.env.local` 文件，包含必要的环境变量
- 如果使用 Supabase 或 OpenAI，需要使用真实的 API 密钥
- 确保 `.env.local` 文件中的 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 已正确设置

### 4. Prisma 相关问题

**问题描述**：使用 Prisma ORM 需要生成客户端代码。

**解决方案**：
- 运行 `npx prisma generate` 生成 Prisma 客户端
- 确保 `schema.prisma` 文件配置正确

### 5. Tailwind CSS 错误

**问题描述**：启动应用时出现 "The `border-border` class does not exist" 错误。

**解决方案**：
- 更新 `tailwind.config.js` 文件，添加缺少的边框和颜色主题配置
- 确保 CSS 变量与 Tailwind 配置匹配
- 如果使用了 @apply 指令，确保引用的类在配置中已定义

### 6. Supabase 依赖错误

**问题描述**：启动应用时出现 "Module not found: Can't resolve '@supabase/supabase-js'" 错误。

**解决方案**：
- 运行 `npm install @supabase/supabase-js` 安装 Supabase 客户端依赖
- 如果仍然出错，尝试删除 `node_modules` 文件夹和 `package-lock.json` 文件，然后重新运行 `npm install`
- 确保您的 `package.json` 中包含了 Supabase 相关依赖

### 7. 笔记创建或更新失败

**问题描述**：尝试创建或更新笔记时出现 "笔记创建失败" 或 "笔记更新失败" 错误。

**解决方案**：
- 检查 Supabase 表结构是否正确设置，确保 `notes` 表包含了所有必要的字段
- 确认您创建了 RLS（行级安全）策略，允许已认证用户创建和编辑自己的笔记
- 检查控制台是否有更详细的错误信息
- 确保 `user_id` 字段正确关联到当前登录用户的 ID

### 8. 仪表盘页面空白或不加载笔记

**问题描述**：仪表盘页面加载，但没有显示任何笔记，或页面完全空白。

**解决方案**：
- 确保您已登录，并且成功创建了至少一篇笔记
- 检查浏览器控制台中是否有 API 错误
- 确认 Supabase 查询正确，检查 RLS 策略是否允许用户读取自己的笔记
- 尝试清除浏览器缓存或在隐私模式下打开应用

### 9. 用户认证问题

**问题描述**：登录后立即被重定向回登录页面，或无法保持登录状态。

**解决方案**：
- 确保 Supabase 认证配置正确
- 检查 AuthContext 是否正确管理和存储用户会话
- 验证 `.env.local` 文件中的 Supabase URL 和匿名密钥是否正确
- 清除浏览器的 localStorage 和 cookies，然后重新登录

### 10. Markdown 编辑器问题

**问题描述**：Markdown 编辑器无法正常加载或渲染，或显示样式异常。

**解决方案**：
- 确保安装了所有必要的依赖：`npm install react-markdown remark-gfm react-syntax-highlighter rehype-raw @uiw/react-md-editor`
- 检查 Markdown 编辑器组件导入是否正确
- 检查浏览器控制台是否有报错信息
- 如果出现类型错误，尝试安装 `@types/react-syntax-highlighter`

### 11. 代码高亮显示问题

**问题描述**：代码块未正确高亮显示或样式异常。

**解决方案**：
- 确保 `react-syntax-highlighter` 依赖已正确安装
- 检查 Markdown 中的代码块是否使用了正确的语法（例如：\```javascript）
- 尝试使用不同的代码高亮主题，如 `atomDark`、`prism` 或 `github`
- 如果仍有问题，尝试重新安装相关依赖

### 12. AI功能不可用

**问题描述**：AI标签推荐或摘要生成功能不可用或不显示。

**解决方案**：
- 确保已运行 `scripts/start-api.bat` 启动后端API服务
- 确保本地已安装并运行 Ollama 服务
- 确保已在 Ollama 中拉取 `qwen3:30b-a3b` 模型（运行命令 `ollama pull qwen3:30b-a3b`）
- 检查控制台是否有网络相关的错误信息
- 确认 Ollama API 服务运行在默认的 11434 端口（http://localhost:11434）

### 13. AI返回内容格式错误

**问题描述**：AI返回的标签格式不正确或摘要质量较差。

**解决方案**：
- 修改 `src/server/ollama-api.py` 中的提示词，使其更明确
- 调整 `temperature` 参数：对于标签推荐，降低值可以获得更一致的结果
- 对于标签，可以在前端或后端添加额外的后处理步骤，如移除特殊字符或限制长度
- 确保没有过度截断输入内容，尤其是长篇笔记

### 14. Python FastAPI启动失败

**问题描述**：运行 `start-api.bat` 时出现错误，无法启动后端服务。

**解决方案**：
- 确保已安装所需的Python包：`pip install fastapi uvicorn httpx pydantic`
- 检查端口9000是否被其他应用占用，如果是，修改 `ollama-api.py` 中的端口号
- 确保Python版本在3.7或以上
- 在命令行中手动运行以查看详细错误信息：`cd src/server && python ollama-api.py`

### 15. 长笔记生成摘要超时

**问题描述**：尝试为长篇笔记生成摘要时出现"生成摘要失败"或"请求超时"错误。

**解决方案**：
- 尝试缩短笔记内容，内容越长处理时间越长
- 确保Ollama模型有足够的系统资源（特别是GPU内存）
- 后端API已配置3分钟的超时时间，对于非常长的笔记可能仍然不够
- 如需更长的超时时间，可以修改`src/server/ollama-api.py`中的`timeout`参数
- 尝试将笔记分成几个部分，分别生成摘要后合并

### 16. 思考标签显示问题

**问题描述**：AI生成的摘要或标签中，思考过程（`<think>`标签内容）没有正确显示或折叠。

**解决方案**：
- 确保已正确集成`ThinkableContent`组件，用于处理带有思考标签的内容
- 检查浏览器控制台是否有React组件相关的错误
- 如果思考标签内容完全不显示，检查正则表达式是否正确匹配标签内容
- 如果按钮点击后不展开内容，检查React状态更新逻辑
- 有时大模型可能不会按照指定格式返回内容，这种情况下可能需要重新生成

## 项目启动步骤

1. 安装依赖：
   ```
   npm install
   ```

2. 生成 Prisma 客户端：
   ```
   npx prisma generate
   ```

3. 创建 `.env.local` 文件并配置环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. 启动AI后端服务：
   ```
   scripts/start-api.bat
   ```

5. 运行开发服务器：
   ```
   npm run dev
   ```
   或使用批处理脚本：
   ```
   start-dev.bat
   ```

## 注意事项

- 确保 Node.js 和 npm 版本符合项目要求
- 确保 Python 3.7+ 已安装，用于运行AI服务
- 确保 Ollama 已安装并运行
- 确保已下载所需的语言模型：`ollama pull qwen3:30b-a3b`
- 在运行脚本前检查当前工作目录
- 如果修改了 Prisma 模型，需要重新生成客户端
- 使用 Supabase 时需要创建项目并设置数据库表结构 