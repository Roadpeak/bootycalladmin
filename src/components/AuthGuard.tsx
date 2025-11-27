'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const publicPaths = ['/login', '/'];
      const isPublicPath = publicPaths.includes(pathname);

      if (!isPublicPath && !isAuthenticated()) {
        // Redirect to login if not authenticated
        router.push('/login');
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
