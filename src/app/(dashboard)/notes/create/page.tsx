'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import MarkdownEditor from '@/components/notes/MarkdownEditor';
import { suggestTags, checkAIServiceAvailability } from '@/lib/ai-utils';
import ThinkableContent from '@/components/ThinkableContent';

export default function CreateNotePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isAIAvailable, setIsAIAvailable] = useState(false);

  // 检查AI服务是否可用
  useEffect(() => {
    const checkAIService = async () => {
      const available = await checkAIServiceAvailability();
      setIsAIAvailable(available);
    };

    checkAIService();
  }, []);

  // 检查标签响应中是否包含思考标签
  const processTagResponse = (tags: string[]): string[] => {
    if (tags.length === 0) return [];
    
    // 如果第一个标签包含思考内容，需要特殊处理
    if (tags[0].includes('<think>')) {
      // 过滤掉可能包含的思考标签
      return tags.map(tag => {
        // 移除可能的思考标签
        return tag.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      }).filter(tag => tag.length > 0);
    }
    
    return tags;
  };

  const handleSuggestTags = async () => {
    if (!title || !content || content.length < 10) {
      setError('需要有足够的内容才能推荐标签');
      return;
    }

    setIsGeneratingTags(true);
    setError('');

    try {
      const recommendedTags = await suggestTags(content, title);
      // 处理可能包含思考标签的响应
      setSuggestedTags(processTagResponse(recommendedTags));
    } catch (err: any) {
      console.error('标签推荐失败:', err);
      setError('标签推荐失败: ' + (err.message || '未知错误'));
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const addTagToList = (tag: string) => {
    const currentTags = tags ? tags.split(',').map(t => t.trim()) : [];
    
    // 确保不重复添加
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];
      setTags(newTags.join(', '));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user) {
      setError('您必须登录才能创建笔记');
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
      
      // 在Supabase中插入新笔记
      const { data, error: supabaseError } = await supabase
        .from('notes')
        .insert([
          {
            user_id: user.id,
            title,
            content,
            tags: tagArray
          }
        ])
        .select();
        
      if (supabaseError) {
        throw supabaseError;
      }
      
      // 重定向到笔记列表页面
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('笔记创建失败:', err);
      setError('笔记创建失败: ' + (err.message || '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">创建新笔记</h1>
      
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
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="tags" className="block text-sm font-medium">
              标签 (用逗号分隔)
            </label>
            {isAIAvailable && (
              <button
                type="button"
                onClick={handleSuggestTags}
                disabled={isGeneratingTags || !title || content.length < 10}
                className={`text-sm px-2 py-1 rounded ${
                  isGeneratingTags || !title || content.length < 10
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {isGeneratingTags ? '生成中...' : 'AI推荐标签'}
              </button>
            )}
          </div>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-2"
            placeholder="笔记,项目,想法"
          />
          
          {suggestedTags.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">推荐标签:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addTagToList(tag)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
                  >
                    {tag} +
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? '保存中...' : '保存笔记'}
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