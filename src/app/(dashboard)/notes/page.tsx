'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到仪表盘页面
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在重定向...</p>
      </div>
    </div>
  );
} 