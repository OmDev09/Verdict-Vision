'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/dashboard-nav';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Scale, Users, Briefcase, FileText, Search, IndianRupee, CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';

type Stats = { users: number; lawyers: number; cases: number; searches: number; revenue: number };
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  enrollmentNo: string | null;
  lawyerVerificationStatus: string | null;
  createdAt: string;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!loading && user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    api<Stats>('/admin/stats').then(setStats).catch(() => {});
    api<UserRow[]>('/admin/users').then(setUsers).catch(() => setUsers([]));
  }, [user]);

  async function approveLawyer(userId: string) {
    setActioningId(userId);
    try {
      await api('/admin/lawyers/approve', { method: 'POST', body: JSON.stringify({ userId }) });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, lawyerVerificationStatus: 'APPROVED' } : u))
      );
    } catch {
      // keep UI as is on error
    } finally {
      setActioningId(null);
    }
  }

  async function rejectLawyer(userId: string) {
    setActioningId(userId);
    try {
      await api('/admin/lawyers/reject', { method: 'POST', body: JSON.stringify({ userId }) });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, lawyerVerificationStatus: 'REJECTED' } : u))
      );
    } catch {
      // keep UI as is on error
    } finally {
      setActioningId(null);
    }
  }

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Scale className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-muted-foreground font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  const pendingLawyers = users.filter((u) => u.role === 'LAWYER' && u.lawyerVerificationStatus === 'PENDING');

  return (
    <div className="min-h-screen page-gradient">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground mb-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Admin
        </motion.h1>
        <p className="text-muted-foreground mb-8">Manage users, verify lawyers, and view stats.</p>

        {stats && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {[
              { label: 'Users', value: stats.users, icon: Users },
              { label: 'Lawyers', value: stats.lawyers, icon: Briefcase },
              { label: 'Cases', value: stats.cases, icon: FileText },
              { label: 'Searches', value: stats.searches, icon: Search },
              { label: 'Revenue (₹)', value: Number(stats.revenue).toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: IndianRupee },
            ].map((item, i) => (
              <div
                key={item.label}
                className="card-premium p-4 flex items-center gap-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="text-xl font-bold text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {pendingLawyers.length > 0 && (
          <motion.section
            className="mb-10"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              <h2 className="font-semibold text-lg text-foreground">Verify lawyers</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Lawyers with status <strong className="text-foreground">PENDING</strong> need verification. Click <strong>Approve</strong> to mark them verified, or <strong>Reject</strong> to deny.  </p>
            <div className="rounded-2xl border border-border/60 overflow-hidden bg-card/50 dark:bg-card/80 backdrop-blur">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/40 dark:bg-muted/20">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Enrollment</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLawyers.map((u) => (
                    <tr key={u.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">{u.enrollmentNo ?? '—'}</td>
                      <td className="p-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1.5"
                          onClick={() => approveLawyer(u.id)}
                          disabled={actioningId === u.id}
                        >
                          {actioningId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => rejectLawyer(u.id)}
                          disabled={actioningId === u.id}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-semibold text-lg text-foreground mb-4">All users</h2>
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted/40 dark:bg-muted/20">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Credits</th>
                    <th className="text-left p-3 font-medium">Enrollment</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-border/50 hover:bg-muted/10 transition-colors">
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.role === 'ADMIN' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' :
                          u.role === 'LAWYER' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">{u.credits}</td>
                      <td className="p-3">{u.enrollmentNo ?? '—'}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.lawyerVerificationStatus === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
                          u.lawyerVerificationStatus === 'REJECTED' ? 'bg-destructive/15 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {u.lawyerVerificationStatus ?? '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
