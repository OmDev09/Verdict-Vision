'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { PublicHeader } from '@/components/public-header';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/lib/api';

const formVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 + 0.1, duration: 0.3 },
  }),
};

function RegisterForm() {
  const router = useRouter();
  const { refetch } = useAuth();
  const searchParams = useSearchParams();
  const isLawyer = searchParams.get('type') === 'lawyer';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('type') === 'lawyer') setEnrollmentNo('BR/20/');
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = isLawyer
        ? await authApi.registerLawyer({ name, email, password, enrollmentNo })
        : await authApi.register({ name, email, password });
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      await refetch();
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen page-gradient flex flex-col">
      <PublicHeader rightSlot={<Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>} />

      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="pointer-events-none absolute -left-20 top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
        <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-orange-400/15 blur-3xl dark:bg-orange-300/12" />
        <motion.div
          className="relative z-10 w-full max-w-md glass-card p-8 md:p-10"
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
            {isLawyer ? 'Register as lawyer' : 'Create account'}
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-center mb-8"
            custom={1}
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            {isLawyer ? 'Add your Bar Council details to get lawyer features.' : 'Get 10 free credits to start.'}
          </motion.p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div custom={2} variants={formVariants} initial="hidden" animate="visible">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5 rounded-xl" />
            </motion.div>
            <motion.div custom={3} variants={formVariants} initial="hidden" animate="visible">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 rounded-xl"
              />
            </motion.div>
            <motion.div custom={4} variants={formVariants} initial="hidden" animate="visible">
              <Label htmlFor="password">Password (8+ chars, upper, lower, number)</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5 rounded-xl"
              />
            </motion.div>
            {isLawyer && (
              <motion.div custom={5} variants={formVariants} initial="hidden" animate="visible">
                <Label htmlFor="enrollment">Bar Council enrollment number (e.g. BR/20/123456)</Label>
                <Input
                  id="enrollment"
                  placeholder="BR/20/123456"
                  value={enrollmentNo}
                  onChange={(e) => setEnrollmentNo(e.target.value)}
                  required
                  className="mt-1.5 rounded-xl"
                />
              </motion.div>
            )}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}
            <motion.div custom={6} variants={formVariants} initial="hidden" animate="visible">
              <Button type="submit" className="w-full rounded-xl h-11 font-medium" disabled={loading}>
                {loading ? 'Creating account…' : isLawyer ? 'Register as lawyer' : 'Create account'}
              </Button>
            </motion.div>
          </form>
          <motion.p
            className="text-center text-sm text-muted-foreground mt-6"
            custom={7}
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
