'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

export function ThemeBackdrop() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 theme-surface" />
      <motion.div
        className={cn(
          'absolute left-1/2 top-1/2 h-[48vw] w-[48vw] min-h-[320px] min-w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl',
          isDark ? 'theme-orb-dark' : 'theme-orb-light'
        )}
        animate={
          isDark
            ? { x: [-26, 18, -12, -26], y: [18, -12, 16, 18], scale: [1, 1.08, 0.96, 1] }
            : { x: [24, -14, 18, 24], y: [-14, 12, -18, -14], scale: [1, 0.94, 1.05, 1] }
        }
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={cn(
          'absolute left-1/2 top-1/2 h-[60vw] w-[60vw] min-h-[420px] min-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full',
          isDark ? 'theme-ring-dark' : 'theme-ring-light'
        )}
        animate={{ rotate: isDark ? 360 : -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute inset-0 theme-noise" />
    </div>
  );
}
