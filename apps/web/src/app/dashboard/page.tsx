'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Wallet, FileText, ArrowRight, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardNav } from '@/components/dashboard-nav';
import { useAuth } from '@/contexts/auth-context';

const userCards = [
  {
    icon: Search,
    title: 'Legal search',
    desc: 'Describe your situation and get AI-powered insights with similar cases.',
    href: '/search',
    label: 'Search',
    gradient: 'from-primary/15 to-primary/5 dark:from-primary/20 dark:to-primary/5',
    delay: 0,
  },
  {
    icon: FileText,
    title: 'Search history',
    desc: 'Review your past queries, AI responses, and case law matches.',
    href: '/search?history=1',
    label: 'History',
    gradient: 'from-sky-500/10 to-cyan-500/5 dark:from-sky-500/15 dark:to-cyan-500/10',
    delay: 0.08,
  },
  {
    icon: Wallet,
    title: 'My credits',
    desc: 'Check your balance and add more credits to continue searching.',
    href: '/wallet',
    label: 'View wallet',
    gradient: 'from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/15 dark:to-teal-500/10',
    delay: 0.16,
  },
];

const lawyerCards = [
  {
    icon: Search,
    title: 'Advanced Research',
    desc: 'Access professional case retrieval with drafting templates and courtroom arguments.',
    href: '/search',
    label: 'New Query',
    gradient: 'from-indigo-600/15 to-blue-600/5 dark:from-indigo-500/20 dark:to-blue-500/10',
    delay: 0,
  },
  {
    icon: FileText,
    title: 'Case History',
    desc: 'Access your previous legal queries, PDF judgments, and saved drafts.',
    href: '/search?history=1',
    label: 'View History',
    gradient: 'from-purple-500/10 to-fuchsia-500/5 dark:from-purple-500/15 dark:to-fuchsia-500/10',
    delay: 0.08,
  },
  {
    icon: Wallet,
    title: 'Top up Balance',
    desc: 'Manage your Firm/Professional credits to continue executing deep legal research.',
    href: '/wallet',
    label: 'Go to Wallet',
    gradient: 'from-amber-500/10 to-orange-500/5 dark:from-amber-500/15 dark:to-orange-500/10',
    delay: 0.16,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
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
    <div className="min-h-screen page-gradient">
      <DashboardNav />
      <main className="container mx-auto px-4 py-10 md:py-12 max-w-5xl">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Welcome, {user.name}
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            {user.role === 'LAWYER' ? 'Lawyer account' : 'User account'}
            <span className="mx-2">·</span>
            <span className="font-semibold text-foreground">{user.credits}</span> credits
          </p>
        </motion.header>

        <div className="grid md:grid-cols-3 gap-6">
          {(user.role === 'LAWYER' ? lawyerCards : userCards).map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.delay, duration: 0.35 }}
              className="group"
            >
              <Link href={card.href} className="block h-full">
                <div className="card-premium p-6 h-full flex flex-col border border-border/40 hover:border-primary/30 hover:shadow-lg transition-all">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl mb-5 bg-gradient-to-br ${card.gradient} text-foreground transition-transform duration-300 group-hover:scale-110`}
                  >
                    <card.icon className="h-7 w-7 opacity-80" strokeWidth={1.8} />
                  </div>
                  <h2 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{card.title}</h2>
                  <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
                    {card.desc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all uppercase tracking-wide">
                    {card.label}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
