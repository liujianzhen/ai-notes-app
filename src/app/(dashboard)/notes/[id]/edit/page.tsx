'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import MarkdownEditor from '@/components/notes/MarkdownEditor';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  user_id: string;
}

export default function EditNotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

        // 确保只有笔记的所有者才能编辑
        if (data.user_id !== user.id) {
          router.push('/dashboard');
          return;
        }

        setTitle(data.title);
        setContent(data.content);
        if (data.tags && Array.isArray(data.tags)) {
          setTags(data.tags.join(', '));
        }
      } catch (err: any) {
        console.error('获取笔记失败:', err);
        setError('无法加载笔记: ' + (err.message || '未知错误'));
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [params.id, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      setError('您必须登录才能编辑笔记');
      return;
    }

    if (!title || !content) {
      setError('标题和内容不能为空');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 转换标签为数组
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      // 更新Supabase中的笔记
      const { error: supabaseError } = await supabase
        .from('notes')
        .update({
          title,
          content,
          tags: tagArray,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (supabaseError) {
        throw supabaseError;
      }

      // 重定向到笔记详情页面
      router.push(`/notes/${params.id}`);
      router.refresh();
    } catch (err: any) {
      console.error('笔记更新失败:', err);
      setError('笔记更新失败: ' + (err.message || '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[60vh]">
        <div className="text-xl text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">编辑笔记</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            标题
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="请输入笔记标题"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            内容
          </label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="请输入笔记内容..."
            height={400}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            标签 (用逗号分隔)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="笔记,项目,想法"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? '保存中...' : '保存修改'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
} 