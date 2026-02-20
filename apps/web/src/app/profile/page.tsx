'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { useAuth } from '@/contexts/auth-context';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium">Loading…</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen page-gradient">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card-premium p-6 md:p-8"
        >
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-muted-foreground">Name</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Role</dt>
              <dd className="font-medium">{user.role}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Credits</dt>
              <dd className="font-medium">{user.credits}</dd>
            </div>
            {user.role === 'LAWYER' && (
              <>
                <div>
                  <dt className="text-sm text-muted-foreground">Enrollment number</dt>
                  <dd className="font-medium">{user.enrollmentNo ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Verification</dt>
                  <dd className="font-medium">{user.lawyerVerificationStatus ?? 'PENDING'}</dd>
                </div>
              </>
            )}
          </dl>
        </motion.div>
      </main>
    </div>
  );
}
