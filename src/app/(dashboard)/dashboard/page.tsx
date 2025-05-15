"use client";

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

export default function DashboardPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchNotes() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
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

    fetchNotes();
  }, [user]);

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

  // 计算笔记内容预览 (截取前100个字符)
  function getContentPreview(content: string) {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">我的笔记</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <SearchBar />
          <div className="flex gap-2 w-full sm:w-auto">
            <Link 
              href="/tags"
              className="w-full sm:w-auto text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
            >
              标签管理
            </Link>
            <Link 
              href="/notes/create"
              className="w-full sm:w-auto text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              创建新笔记
            </Link>
          </div>
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
          <p className="text-xl text-gray-600 mb-4">您还没有创建任何笔记</p>
          <Link
            href="/notes/create"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            创建第一个笔记
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
                  {note.tags.map((tag, index) => (
                    <Link 
                      key={index}
                      href={`/tags/${encodeURIComponent(tag)}`}
                      className="inline-block bg-gray-100 hover:bg-gray-200 px-2 py-1 text-xs rounded transition-colors"
                    >
                      {tag}
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