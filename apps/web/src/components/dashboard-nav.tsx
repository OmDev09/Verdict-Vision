'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Wallet, User, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteLogo } from '@/components/site-logo';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/profile', label: 'Profile', icon: User },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-white/55 dark:border-white/10 bg-background/65 dark:bg-background/75 backdrop-blur-2xl shadow-[0_10px_32px_-24px_hsl(var(--foreground)/0.7)]"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <SiteLogo href="/" />
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar px-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'rounded-lg transition-colors whitespace-nowrap',
                  pathname === item.href && 'bg-primary/10 text-primary hover:bg-primary/15'
                )}
              >
                <item.icon className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            </Link>
          ))}
          {user?.role === 'ADMIN' && (
            <Link href="/admin">
              <Button variant={pathname === '/admin' ? 'secondary' : 'ghost'} size="sm" className="rounded-lg">
                Admin
              </Button>
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">Credits: <strong className="text-foreground">{user?.credits ?? 0}</strong></span>
          <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link href="/">
            <Button variant="outline" size="sm" onClick={logout} className="rounded-lg">
              Log out
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
