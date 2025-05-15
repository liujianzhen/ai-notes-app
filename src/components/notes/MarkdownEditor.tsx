"use client";

import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
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

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '请输入Markdown内容...',
  height = 400
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  
  return (
    <div className="markdown-editor w-full">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          支持Markdown语法
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`px-3 py-1 text-sm rounded-md ${
              mode === 'edit'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            编辑
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-1 text-sm rounded-md ${
              mode === 'preview'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            预览
          </button>
        </div>
      </div>
      
      {mode === 'edit' ? (
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview="edit"
          height={height}
          textareaProps={{
            placeholder
          }}
        />
      ) : (
        <div 
          className="markdown-preview border rounded-md p-4 overflow-auto"
          style={{ minHeight: height, maxHeight: height * 1.5 }}
        >
          {value ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code: ({ node, inline, className, children, ...props }: CodeProps) => {
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
                }
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <div className="text-gray-400">{placeholder}</div>
          )}
        </div>
      )}
    </div>
  );
} 