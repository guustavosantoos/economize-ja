'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loadUser, isLoading } = useAuthStore();
  const { sidebarCollapsed } = useThemeStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !user && typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-background dark:bg-[#0c1218] transition-colors">
      <BottomNav />
      {/* Desktop: dynamic margin transition for sidebar (w-64 vs w-20); Mobile: pb-64 */}
      <main className={`pb-[64px] md:pb-0 min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {children}
      </main>
    </div>
  );
}
