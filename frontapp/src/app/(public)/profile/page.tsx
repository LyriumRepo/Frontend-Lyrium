'use client';

import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[Profile] loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user);
    
    if (loading) return;

    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (user.role === 'administrator') {
      router.push('/admin');
    } else if (user.role === 'seller') {
      router.push('/seller/profile');
    } else if (user.role === 'logistics_operator') {
      router.push('/logistics');
    } else if (user.role === 'customer') {
      router.push('/');
    } else {
      console.log('[Profile] Unknown role:', user.role);
      router.push('/');
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] dark:bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </main>
    );
  }

  return null;
}
