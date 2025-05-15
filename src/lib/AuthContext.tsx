'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth, supabase } from './supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// 定义用户类型
export type User = {
  id: string;
  email: string;
  name?: string;
} | null;

// 定义上下文类型
type AuthContextType = {
  user: User;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error: any }>;
  signOut: () => Promise<void>;
};

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 提供者组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 初始化：检查用户是否已登录
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const { user: currentUser, error } = await auth.getCurrentUser();
        
        if (error) {
          console.error('获取用户失败:', error);
          setUser(null);
          return;
        }

        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.user_metadata?.name,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('检查用户状态失败:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // 监听认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // 清理监听器
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 登录
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await auth.signIn(email, password);

      if (error) {
        return { success: false, error };
      }

      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name,
        });
        return { success: true, error: null };
      }

      return { success: false, error: new Error('登录失败') };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // 注册
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await auth.signUp(email, password, { name });

      if (error) {
        return { success: false, error };
      }

      if (data?.user) {
        // 注册后自动登录
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name,
        });
        return { success: true, error: null };
      }

      return { success: false, error: new Error('注册失败') };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // 登出
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 使用钩子
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
} 