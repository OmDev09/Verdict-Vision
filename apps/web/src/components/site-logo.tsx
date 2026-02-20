'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SiteLogo({ className, href = '/' }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2.5 font-semibold text-lg tracking-tight text-foreground no-underline hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg',
        className
      )}
      aria-label="Verdict Vision – Home"
    >
      <motion.span
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"
      >
        <Scale className="h-5 w-5" strokeWidth={2.2} />
      </motion.span>
      <span className="flex items-baseline">
        <span className="font-bold text-foreground">Verdict</span>
        <span className="font-semibold text-primary ml-0.5">Vision</span>
      </span>
    </Link>
  );
}
