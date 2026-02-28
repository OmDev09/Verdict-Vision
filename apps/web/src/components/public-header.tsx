'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteLogo } from '@/components/site-logo';

const slideDown = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function PublicHeader({
  showBackToHome = false,
  rightSlot,
}: {
  showBackToHome?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-white/55 dark:border-white/10 bg-background/62 dark:bg-background/72 backdrop-blur-2xl shadow-[0_8px_34px_-24px_hsl(var(--foreground)/0.6)]"
      initial="hidden"
      animate="visible"
      variants={slideDown}
    >
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-center gap-4">
          <SiteLogo />
          {showBackToHome && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Button>
              </Link>
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2">{rightSlot}</div>
      </div>
    </motion.header>
  );
}
