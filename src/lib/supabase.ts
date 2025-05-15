import { createClient } from '@supabase/supabase-js';

// 环境变量在构建时会被替换为实际值
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 验证环境变量是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少Supabase环境变量。请确保您已设置NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY。');
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 认证相关方法
export const auth = {
  // 用户注册
  async signUp(email: string, password: string, userData?: { name: string }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('注册失败:', error);
      return { data: null, error };
    }
  },

  // 用户登录
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('登录失败:', error);
      return { data: null, error };
    }
  },

  // 用户登出
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('登出失败:', error);
      return { error };
    }
  },

  // 获取当前用户
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return { user: null, error };
    }
  },

  // 获取会话
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      console.error('获取会话失败:', error);
      return { session: null, error };
    }
  }
};

// 笔记相关方法
export const notes = {
  // 获取用户的所有笔记
  async getAllNotes() {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('获取笔记失败:', error);
      return { data: null, error };
    }
  },

  // 获取单个笔记
  async getNote(id: string) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`获取笔记ID:${id}失败:`, error);
      return { data: null, error };
    }
  },

  // 创建笔记
  async createNote(noteData: { title: string, content: string, tags?: string[] }) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([noteData])
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('创建笔记失败:', error);
      return { data: null, error };
    }
  },

  // 更新笔记
  async updateNote(id: string, noteData: { title?: string, content?: string, tags?: string[] }) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(noteData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`更新笔记ID:${id}失败:`, error);
      return { data: null, error };
    }
  },

  // 删除笔记
  async deleteNote(id: string) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error(`删除笔记ID:${id}失败:`, error);
      return { error };
    }
  }
}; 