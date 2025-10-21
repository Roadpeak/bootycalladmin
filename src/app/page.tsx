'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after page loads
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative w-32 h-32">
            {/* Replace with your actual logo */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-full">
              <span className="text-white text-2xl font-bold">BCA</span>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">BootyCallAdmin</h1>
        <p className="text-gray-600 mb-8">Redirecting to dashboard...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    </div>
  );
}