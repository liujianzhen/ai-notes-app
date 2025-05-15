# Vercel部署说明

## 1. 部署前的准备工作

在将应用部署到Vercel之前，请确保解决以下可能出现的问题：

### TypeScript类型错误

Vercel在部署过程中会进行TypeScript类型检查。如果您的项目包含TypeScript类型错误，部署将会失败。本项目中常见的类型错误包括：

#### React-Markdown组件的类型错误

我们已经修复了两个文件中的类型错误：

1. **MarkdownEditor.tsx** - 使用自定义CodeProps接口解决了类型问题
2. **MarkdownRenderer.tsx** - 同样需要为所有组件参数添加类型定义

错误的原因是react-markdown库中的组件需要正确的类型定义。我们通过定义自己的接口解决了这个问题：

```typescript
// 定义自己的Code组件props类型
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

// 定义其他Markdown元素的props类型
interface NodeProps {
  node?: any;
  children?: React.ReactNode;
  [key: string]: any;
}
```

这些接口需要应用到所有Markdown相关组件的属性解构中：

```typescript
// 错误写法
code({node, inline, className, children, ...props}) { ... }

// 正确写法（带类型注解）
code({node, inline, className, children, ...props}: CodeProps) { ... }
```

如果您在部署过程中遇到其他类型错误，请检查控制台输出，并根据错误信息修复相应的类型定义。

## 2. 部署到Vercel

### 使用Vercel CLI部署

1. 安装Vercel CLI：
   ```
   npm i -g vercel
   ```

2. 登录到您的Vercel账户：
   ```
   vercel login
   ```

3. 在项目根目录下运行部署命令：
   ```
   vercel
   ```

4. 按照提示进行配置，Vercel将自动检测Next.js项目并进行相应配置。

### 通过Vercel网站部署

1. 登录到[Vercel网站](https://vercel.com)
2. 点击"New Project"
3. 导入您的GitHub/GitLab/Bitbucket仓库
4. Vercel将自动检测Next.js项目配置
5. 点击"Deploy"按钮开始部署

## 3. 环境变量配置

在Vercel项目设置中，确保正确配置以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase项目URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名密钥
- 其他您的应用需要的环境变量

## 4. 常见部署问题及解决方案

### 构建错误

如果遇到构建错误，请检查Vercel构建日志，寻找错误信息。常见的错误包括：

1. **依赖安装失败**：检查package.json文件中的依赖版本是否兼容
2. **TypeScript类型错误**：按照错误提示修复类型问题
3. **API路由错误**：确保API路由正确配置并且没有语法错误

### 运行时错误

如果应用成功部署但运行时出现错误：

1. **API连接问题**：检查环境变量是否正确配置
2. **跨域问题**：确保API允许来自您的Vercel域名的请求
3. **数据库连接错误**：验证Supabase配置是否正确

## 5. 部署后的优化

### 性能优化

1. 开启自动静态优化
2. 配置ISR（增量静态再生成）
3. 使用Next.js Image组件优化图片

### 监控

1. 在Vercel仪表板中监控应用性能
2. 配置错误报告和通知

## 6. 备份与回滚

### 版本回滚

如果新版本出现问题，可以在Vercel仪表板中快速回滚到之前的部署版本。

### 数据备份

确保定期备份您的Supabase数据库内容。 