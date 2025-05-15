'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import SearchBar from '@/components/SearchBar';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const tag = decodeURIComponent(params.tag);

  useEffect(() => {
    async function fetchNotesByTag() {
      if (!user) return;

      try {
        // 这里的查询需要Supabase支持对JSON/数组列进行过滤
        // 如果Supabase版本不支持，可能需要调整数据库设计或服务端逻辑
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .contains('tags', [tag])  // 过滤包含特定标签的笔记
          .order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }

        setNotes(data || []);
      } catch (err: any) {
        console.error('获取笔记失败:', err);
        setError('无法加载笔记: ' + (err.message || '未知错误'));
      } finally {
        setLoading(false);
      }
    }

    fetchNotesByTag();
  }, [user, tag]);

  // 格式化日期
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 计算笔记内容预览
  function getContentPreview(content: string) {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <Link href="/dashboard" className="text-blue-600 hover:underline flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            返回所有笔记
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <span className="mr-2">标签:</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{tag}</span>
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <SearchBar />
          <Link 
            href="/notes/create"
            className="w-full sm:w-auto text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            创建新笔记
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="text-xl text-gray-500">加载中...</div>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-xl text-gray-600 mb-4">没有找到带有标签 "{tag}" 的笔记</p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            查看所有笔记
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2 truncate">
                <Link href={`/notes/${note.id}`} className="hover:text-blue-600">
                  {note.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4 text-sm h-20 overflow-hidden">
                {getContentPreview(note.content)}
              </p>
              
              {note.tags && note.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {note.tags.map((noteTag, index) => (
                    <Link 
                      key={index}
                      href={`/tags/${encodeURIComponent(noteTag)}`}
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        noteTag === tag 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {noteTag}
                    </Link>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center mt-auto pt-2 text-sm text-gray-500">
                <span>更新于: {formatDate(note.updated_at)}</span>
                <div className="flex gap-2">
                  <Link 
                    href={`/notes/${note.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    编辑
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 