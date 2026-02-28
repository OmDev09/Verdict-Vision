'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Wallet, FileText, ArrowRight, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardNav } from '@/components/dashboard-nav';
import { useAuth } from '@/contexts/auth-context';

const cards = [
  {
    icon: Search,
    title: 'Legal search',
    desc: 'Describe your situation and get AI-powered insights with similar cases.',
    href: '/search',
    label: 'Search',
    variant: 'default' as const,
    gradient: 'from-primary/15 to-primary/5 dark:from-primary/20 dark:to-primary/5',
    delay: 0,
  },
  {
    icon: Wallet,
    title: 'Wallet',
    desc: 'Add credits when you run out. Basic, Pro, and Lawyer Premium plans.',
    href: '/wallet',
    label: 'View wallet',
    variant: 'outline' as const,
    gradient: 'from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/15 dark:to-teal-500/10',
    delay: 0.08,
  },
  {
    icon: FileText,
    title: 'Search history',
    desc: 'Your past searches and results.',
    href: '/search?history=1',
    label: 'History',
    variant: 'outline' as const,
    gradient: 'from-sky-500/10 to-cyan-500/5 dark:from-sky-500/15 dark:to-cyan-500/10',
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
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.delay, duration: 0.35 }}
              className="group"
            >
              <Link href={card.href} className="block h-full">
                <div className="card-premium p-6 h-full flex flex-col">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl mb-5 bg-gradient-to-br ${card.gradient} text-primary transition-transform duration-300 group-hover:scale-110`}
                  >
                    <card.icon className="h-7 w-7" strokeWidth={1.8} />
                  </div>
                  <h2 className="font-semibold text-lg text-foreground mb-2">{card.title}</h2>
                  <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
                    {card.desc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
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
