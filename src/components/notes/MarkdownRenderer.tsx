"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) {
    return null;
  }
  
  return (
    <div className={`markdown-content prose max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({node, inline, className, children, ...props}: CodeProps) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // 自定义其他Markdown元素的渲染
          h1: ({node, ...props}: NodeProps) => <h1 className="text-2xl font-bold my-4" {...props} />,
          h2: ({node, ...props}: NodeProps) => <h2 className="text-xl font-bold my-3" {...props} />,
          h3: ({node, ...props}: NodeProps) => <h3 className="text-lg font-bold my-2" {...props} />,
          a: ({node, ...props}: NodeProps) => <a className="text-blue-600 hover:underline" {...props} />,
          ul: ({node, ...props}: NodeProps) => <ul className="list-disc pl-5 my-2" {...props} />,
          ol: ({node, ...props}: NodeProps) => <ol className="list-decimal pl-5 my-2" {...props} />,
          blockquote: ({node, ...props}: NodeProps) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />,
          hr: ({node, ...props}: NodeProps) => <hr className="my-4 border-gray-300" {...props} />,
          img: ({node, ...props}: NodeProps) => <img className="max-w-full h-auto rounded my-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}