'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { PublicHeader } from '@/components/public-header';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/lib/api';

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06 + 0.15, duration: 0.35 },
  }),
};

export default function LoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken, refreshToken } = await authApi.login({ email, password });
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      await refetch();
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen page-gradient flex flex-col">
      <PublicHeader rightSlot={<Link href="/register"><Button variant="ghost" size="sm">Sign up</Button></Link>} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md glass-card p-8 md:p-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.h1
            className="text-2xl md:text-3xl font-bold text-center mb-2"
            custom={0}
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            Log in to Verdict Vision
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-center mb-8"
            custom={1}
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            Welcome back. Sign in to continue.
          </motion.p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div custom={2} variants={formVariants} initial="hidden" animate="visible">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 rounded-xl border-border/80 focus:ring-2"
              />
            </motion.div>
            <motion.div custom={3} variants={formVariants} initial="hidden" animate="visible">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5 rounded-xl border-border/80 focus:ring-2"
              />
            </motion.div>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}
            <motion.div custom={4} variants={formVariants} initial="hidden" animate="visible">
              <Button
                type="submit"
                className="w-full rounded-xl h-11 font-medium"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </motion.div>
          </form>
          <motion.p
            className="text-center text-sm text-muted-foreground mt-6"
            custom={5}
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Register
            </Link>
            {' · '}
            <Link href="/register?type=lawyer" className="text-primary font-medium hover:underline">
              Lawyer sign up
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
