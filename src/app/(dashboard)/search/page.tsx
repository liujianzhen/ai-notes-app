'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user } = useAuth();
  
  const [results, setResults] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function searchNotes() {
      if (!user || !query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 使用Supabase全文搜索或模糊匹配
        // 注意：这里使用ilike进行简单搜索，生产环境可能需要考虑使用全文搜索扩展
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }

        setResults(data || []);
      } catch (err: any) {
        console.error('搜索失败:', err);
        setError('搜索失败: ' + (err.message || '未知错误'));
      } finally {
        setLoading(false);
      }
    }

    searchNotes();
  }, [query, user]);

  // 高亮显示匹配文本
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200">{part}</mark> 
        : part
    );
  };

  // 截取内容预览
  const getContentPreview = (content: string, query: string, maxLength = 200) => {
    if (!content) return '';
    
    // 如果内容包含查询词，尝试截取查询词周围的内容
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index >= 0) {
      const start = Math.max(0, index - 80);
      const end = Math.min(content.length, index + query.length + 80);
      const preview = (start > 0 ? '...' : '') + 
                      content.substring(start, end) + 
                      (end < content.length ? '...' : '');
      return preview;
    }
    
    // 如果未找到查询词或查询词为空，返回前N个字符
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">搜索结果</h1>
      
      <div className="mb-6">
        <SearchBar />
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">正在搜索...</p>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-4">
            {query ? `找到 ${results.length} 个结果，关键词: "${query}"` : '请输入搜索关键词'}
          </div>

          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((note) => (
                <div key={note.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                  <Link href={`/notes/${note.id}`}>
                    <h2 className="text-xl font-semibold text-blue-600 hover:underline mb-2">
                      {highlightText(note.title, query)}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-600 mb-3">
                    {highlightText(getContentPreview(note.content, query), query)}
                  </p>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {note.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 px-2 py-1 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-2">
                    最后更新于: {new Date(note.updated_at).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              {query && (
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <p className="text-gray-600">没有找到匹配的笔记</p>
                  <p className="text-sm text-gray-500 mt-1">尝试使用不同的关键词搜索</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 