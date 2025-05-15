'use client';

import { useState } from 'react';

interface ThinkableContentProps {
  content: string;
}

/**
 * 处理带有思考标签的内容组件
 * 自动识别并折叠<think>标签中的内容，用户可点击展开/折叠
 */
export default function ThinkableContent({ content }: ThinkableContentProps) {
  const [expandedThoughts, setExpandedThoughts] = useState<boolean[]>([]);
  
  // 如果内容不包含思考标签，直接返回原始内容
  if (!content.includes('<think>')) {
    return <div>{content}</div>;
  }
  
  // 解析内容，分离常规文本和思考内容
  const parts = [];
  let currentIndex = 0;
  let partIndex = 0;
  
  // 正则表达式匹配<think>...</think>标签
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  let match;
  
  while ((match = thinkRegex.exec(content)) !== null) {
    // 添加思考标签之前的普通文本
    if (match.index > currentIndex) {
      parts.push({
        type: 'text',
        content: content.substring(currentIndex, match.index),
        id: partIndex++
      });
    }
    
    // 添加思考内容
    parts.push({
      type: 'think',
      content: match[1], // 获取<think>标签内的内容
      id: partIndex++
    });
    
    currentIndex = match.index + match[0].length;
  }
  
  // 添加最后一部分普通文本（如果有）
  if (currentIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(currentIndex),
      id: partIndex++
    });
  }
  
  // 初始化展开/折叠状态数组
  if (expandedThoughts.length === 0 && parts.some(part => part.type === 'think')) {
    setExpandedThoughts(new Array(parts.filter(part => part.type === 'think').length).fill(false));
  }
  
  // 切换思考部分的展开/折叠状态
  const toggleThought = (index: number) => {
    const newExpandedThoughts = [...expandedThoughts];
    newExpandedThoughts[index] = !newExpandedThoughts[index];
    setExpandedThoughts(newExpandedThoughts);
  };
  
  // 跟踪当前思考块的索引
  let thoughtIndex = 0;
  
  return (
    <div className="thinkable-content">
      {parts.map((part) => {
        if (part.type === 'text') {
          return <span key={part.id}>{part.content}</span>;
        } else {
          // 思考内容，需要处理展开/折叠
          const currentThoughtIndex = thoughtIndex;
          const isExpanded = expandedThoughts[thoughtIndex];
          thoughtIndex++;
          
          return (
            <div key={part.id} className="think-block my-2">
              <button
                onClick={() => toggleThought(currentThoughtIndex)}
                className="think-toggle flex items-center text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`mr-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                {isExpanded ? '隐藏思考过程' : '显示思考过程'}
              </button>
              
              {isExpanded && (
                <div className="think-content mt-1 p-3 bg-gray-100 border-l-4 border-blue-500 rounded text-sm">
                  {part.content}
                </div>
              )}
            </div>
          );
        }
      })}
    </div>
  );
} 