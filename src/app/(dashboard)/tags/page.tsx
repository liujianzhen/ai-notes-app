'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

interface TagCount {
  tag: string;
  count: number;
}

export default function AllTagsPage() {
  const { user } = useAuth();
  const [tagCounts, setTagCounts] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAllTags() {
      if (!user) return;

      try {
        // 获取用户的所有笔记
        const { data: notes, error } = await supabase
          .from('notes')
          .select('tags')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        // 统计每个标签出现的次数
        const tagFrequency: Record<string, number> = {};
        
        notes.forEach(note => {
          if (note.tags && Array.isArray(note.tags)) {
            note.tags.forEach(tag => {
              if (tag) {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
              }
            });
          }
        });

        // 转换为数组并按数量排序
        const sortedTags = Object.entries(tagFrequency)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

        setTagCounts(sortedTags);
      } catch (err: any) {
        console.error('获取标签失败:', err);
        setError('无法加载标签: ' + (err.message || '未知错误'));
      } finally {
        setLoading(false);
      }
    }

    fetchAllTags();
  }, [user]);

  // 计算标签大小 (基于标签频率)
  function getTagSize(count: number): string {
    const max = tagCounts.length > 0 ? Math.max(...tagCounts.map(t => t.count)) : 0;
    
    if (max <= 1) return 'text-base';
    
    // 根据频率分配不同的尺寸类
    const ratio = count / max;
    if (ratio >= 0.8) return 'text-2xl font-bold';
    if (ratio >= 0.6) return 'text-xl font-semibold';
    if (ratio >= 0.4) return 'text-lg';
    if (ratio >= 0.2) return 'text-base';
    return 'text-sm';
  }

  // 为每个标签分配一个颜色类（固定颜色而非随机，确保一致性）
  function getTagColor(tag: string): string {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-indigo-100 text-indigo-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-red-100 text-red-800',
      'bg-teal-100 text-teal-800',
    ];
    
    // 使用标签字符串生成一个确定性的索引
    let hashCode = 0;
    for (let i = 0; i < tag.length; i++) {
      hashCode = ((hashCode << 5) - hashCode) + tag.charCodeAt(i);
      hashCode |= 0; // 转换为32位整数
    }
    
    const index = Math.abs(hashCode) % colors.length;
    return colors[index];
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/dashboard" className="text-blue-600 hover:underline flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            返回仪表盘
          </Link>
          <h1 className="text-3xl font-bold">所有标签</h1>
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
      ) : tagCounts.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-xl text-gray-600 mb-4">您还没有创建任何标签</p>
          <Link
            href="/notes/create"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            创建一个带标签的笔记
          </Link>
        </div>
      ) : (
        <>
          {/* 标签云 */}
          <div className="bg-white p-6 rounded-lg border mb-8">
            <h2 className="text-xl font-semibold mb-4">标签云</h2>
            <div className="flex flex-wrap gap-3">
              {tagCounts.map((tagItem) => {
                const colorClass = getTagColor(tagItem.tag);
                return (
                  <Link
                    key={tagItem.tag}
                    href={`/tags/${encodeURIComponent(tagItem.tag)}`}
                    className={`px-3 py-2 rounded-full ${colorClass} ${getTagSize(tagItem.count)} transition-transform hover:scale-105`}
                  >
                    {tagItem.tag}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* 标签列表 */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">标签统计</h2>
            <div className="overflow-hidden border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标签
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      笔记数量
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tagCounts.map((tagItem) => (
                    <tr key={tagItem.tag}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{tagItem.tag}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{tagItem.count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/tags/${encodeURIComponent(tagItem.tag)}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          查看笔记
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 