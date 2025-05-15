'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import MarkdownRenderer from '@/components/notes/MarkdownRenderer';
import { generateSummary, checkAIServiceAvailability } from '@/lib/ai-utils';
import ThinkableContent from '@/components/ThinkableContent';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function NotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  // AI 摘要相关状态
  const [summary, setSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isAIAvailable, setIsAIAvailable] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    async function fetchNote() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          throw error;
        }

        // 确保只有笔记的所有者才能查看
        if (data.user_id !== user.id) {
          router.push('/dashboard');
          return;
        }

        setNote(data);
      } catch (err: any) {
        console.error('获取笔记失败:', err);
        setError('无法加载笔记: ' + (err.message || '未知错误'));
      } finally {
        setLoading(false);
      }
    }

    // 检查AI服务是否可用
    const checkAIService = async () => {
      const available = await checkAIServiceAvailability();
      setIsAIAvailable(available);
    };

    fetchNote();
    checkAIService();
  }, [params.id, user, router]);

  // 格式化日期
  function formatDate(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 处理删除笔记
  async function handleDelete() {
    if (!confirm('确定要删除这篇笔记吗？此操作无法撤销。')) {
      return;
    }

    setDeleting(true);

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', params.id);

      if (error) {
        throw error;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('删除笔记失败:', err);
      setError('删除笔记失败: ' + (err.message || '未知错误'));
      setDeleting(false);
    }
  }

  // 生成笔记摘要
  async function handleGenerateSummary() {
    if (!note || !note.content) {
      return;
    }

    setIsGeneratingSummary(true);

    try {
      const generatedSummary = await generateSummary(note.content);
      setSummary(generatedSummary);
      setShowSummary(true);
    } catch (err: any) {
      console.error('生成摘要失败:', err);
      setError('生成摘要失败: ' + (err.message || '未知错误'));
    } finally {
      setIsGeneratingSummary(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[60vh]">
        <div className="text-xl text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          返回
        </button>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          未找到笔记
        </div>
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline"
        >
          返回仪表盘
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          &larr; 返回
        </button>
        <h1 className="text-3xl font-bold flex-grow">{note.title}</h1>
        <div className="flex gap-2">
          <Link
            href={`/notes/${note.id}/edit`}
            className="px-3 py-1 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            编辑
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`px-3 py-1 text-red-600 border border-red-600 rounded-md ${
              deleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50'
            }`}
          >
            {deleting ? '删除中...' : '删除'}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-2 rounded-md text-sm text-gray-500 mb-6 flex flex-wrap gap-4">
        <div>创建于: {formatDate(note.created_at)}</div>
        <div>更新于: {formatDate(note.updated_at)}</div>
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {note.tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-block bg-gray-100 px-2 py-1 text-sm rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* AI摘要区域 */}
      {isAIAvailable && (
        <div className="mb-6">
          {!showSummary ? (
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className={`text-sm px-3 py-1 rounded ${
                isGeneratingSummary
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {isGeneratingSummary ? '生成摘要中...' : 'AI生成摘要'}
            </button>
          ) : (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-blue-800">AI生成的摘要</h3>
                <button
                  onClick={() => setShowSummary(false)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  隐藏摘要
                </button>
              </div>
              <ThinkableContent content={summary} />
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <MarkdownRenderer content={note.content} />
      </div>
    </div>
  );
} 