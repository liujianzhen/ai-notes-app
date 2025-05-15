/**
 * AI功能工具库
 * 用于与后端AI服务通信，提供笔记摘要和标签推荐功能
 */

// 后端API地址
const API_URL = 'http://localhost:9000';

/**
 * 生成笔记摘要
 * @param content 笔记内容
 * @param maxLength 最大摘要长度
 * @returns 生成的摘要
 */
export async function generateSummary(content: string, maxLength: number = 200): Promise<string> {
  try {
    // 设置较长的超时时间（180秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    const response = await fetch(`${API_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        max_length: maxLength,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 特殊处理超时错误
      if (response.status === 408) {
        throw new Error('处理时间过长，请尝试缩短笔记内容');
      }
      throw new Error(errorData.detail || '生成摘要失败');
    }

    const data = await response.json();
    return data.summary;
  } catch (error: any) {
    console.error('摘要生成错误:', error);
    // 处理前端超时情况
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请尝试缩短笔记内容');
    }
    throw new Error(`摘要生成失败: ${error.message || '未知错误'}`);
  }
}

/**
 * 建议笔记标签
 * @param content 笔记内容
 * @param title 笔记标题
 * @param maxTags 最大标签数量
 * @returns 推荐的标签数组
 */
export async function suggestTags(content: string, title: string, maxTags: number = 5): Promise<string[]> {
  try {
    // 设置较长的超时时间（120秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(`${API_URL}/suggest-tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        title,
        max_tags: maxTags,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // 特殊处理超时错误
      if (response.status === 408) {
        throw new Error('处理时间过长，请尝试缩短笔记内容');
      }
      throw new Error(errorData.detail || '推荐标签失败');
    }

    const data = await response.json();
    return data.tags || [];
  } catch (error: any) {
    console.error('标签推荐错误:', error);
    // 处理前端超时情况
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请尝试缩短笔记内容');
    }
    throw new Error(`标签推荐失败: ${error.message || '未知错误'}`);
  }
}

/**
 * 检查AI服务是否可用
 * @returns 服务是否可用
 */
export async function checkAIServiceAvailability(): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('AI服务检查错误:', error);
    return false;
  }
} 