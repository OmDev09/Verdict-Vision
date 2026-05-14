'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scale } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard-nav';
import { useAuth } from '@/contexts/auth-context';
import { UserDashboardView } from './components/UserDashboardView';
import { LawyerDashboardView } from './components/LawyerDashboardView';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!loading && user && user.role === 'ADMIN') router.replace('/admin');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Scale className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-muted-foreground font-medium">Loading…</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className={user.role === 'LAWYER' ? "min-h-screen page-gradient" : "h-screen overflow-hidden flex"}>
      {user.role === 'LAWYER' ? (
        <>
          <DashboardNav />
          <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl overflow-auto">
            <LawyerDashboardView user={user} />
          </main>
        </>
      ) : (
        <UserDashboardView user={user} />
      )}
    </div>
  );
}
