"use client";

import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col min-h-screen">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-xl font-bold text-blue-600">
                    AI笔记助手
                  </Link>
                </div>
              </div>
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  注册
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="flex-grow">
          {children}
        </main>

        {/* 页脚 */}
        <footer className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} AI笔记助手. 保留所有权利.</p>
              <div className="mt-2 flex justify-center space-x-6">
                <Link href="/terms" className="text-gray-400 hover:text-gray-500">
                  服务条款
                </Link>
                <Link href="/privacy" className="text-gray-400 hover:text-gray-500">
                  隐私政策
                </Link>
                <Link href="/contact" className="text-gray-400 hover:text-gray-500">
                  联系我们
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 